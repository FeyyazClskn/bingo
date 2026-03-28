const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateSequence, generate48Cards } = require('./gameLogic');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('Yeni bağlantı:', socket.id);

  socket.on('create_room', ({ playerName }, callback) => {
    try {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const me = { id: socket.id, name: playerName || 'Oyuncu', card: null, marked: null };
      
      rooms[roomId] = {
        id: roomId,
        host: socket.id,
        players: [me],
        started: false,
        sequence: generateSequence(),
        currentIndex: 0,
        drawnNumbers: [],
        intervalId: null,
        cinko1Done: false,
        cinko2Done: false,
        tombalaDone: false,
        availableCards: generate48Cards() // 48 Özel Kart Havuzu
      };

      socket.join(roomId);
      
      callback({ 
        success: true, 
        roomId, 
        isHost: true, 
        players: rooms[roomId].players, 
        availableCards: rooms[roomId].availableCards 
      });
    } catch (err) {
      callback({ success: false, message: err.message });
    }
  });

  socket.on('join_room', ({ roomId, playerName }, callback) => {
    try {
      roomId = roomId.toUpperCase();
      const room = rooms[roomId];
      
      if (!room) return callback({ success: false, message: 'Oda bulunamadı!' });
      if (room.started) return callback({ success: false, message: 'Oyun zaten başlamış!' });

      const me = { id: socket.id, name: playerName || 'Oyuncu', card: null, marked: null };
      
      room.players.push(me);
      socket.join(roomId);

      // Sadece adını göstermek için
      socket.to(roomId).emit('player_joined', room.players);
      
      callback({ 
        success: true, 
        roomId, 
        isHost: false, 
        players: room.players, 
        availableCards: room.availableCards 
      });
    } catch (err) {
      callback({ success: false, message: err.message });
    }
  });

  socket.on('select_card', ({ roomId, cardId }, callback) => {
     const room = rooms[roomId];
     if (!room) return;
     const player = room.players.find(p => p.id === socket.id);
     if (!player && !callback) return;
     if (!player) return callback({ success: false });

     // Eğer kullanıcının zaten kartı varsa eski kartı iade et
     if (player.card) {
        const oldCard = room.availableCards.find(c => c.id === player.card.id);
        if (oldCard) oldCard.owner = null;
     }

     const newCard = room.availableCards.find(c => c.id === cardId);
     if (!newCard || newCard.owner !== null) {
       if(callback) return callback({ success: false, message: 'Bu kart alınmış!' });
       return;
     }

     newCard.owner = socket.id;
     player.card = newCard;
     // Frontend ile senkronize 3x9 boş matris oluşturuyoruz (Pulları denetlemek için)
     player.marked = Array(3).fill().map(() => Array(9).fill(false)); 
     
     // Seçim işlemi tamam, bütün odaya yeni kartları ve oyuncuları yolla
     io.to(roomId).emit('card_selected', { availableCards: room.availableCards, players: room.players });
     if(callback) callback({ success: true, card: newCard });
  });

  socket.on('start_game', (roomId) => {
    const room = rooms[roomId];
    if (room && room.host === socket.id && !room.started) {
      // Başlatmadan önce herkesin bir kart alıp almadığını zorunlu kılıyoruz:
      const allHaveCards = room.players.every(p => p.card !== null);
      if (!allHaveCards) {
          io.to(socket.id).emit('error_notification', 'Tüm oyuncular kart seçmeli!');
          return;
      }

      room.started = true;
      io.to(roomId).emit('game_started');
      
      room.intervalId = setInterval(() => {
        if (room.currentIndex < room.sequence.length) {
          const num = room.sequence[room.currentIndex++];
          room.drawnNumbers.push(num);
          // SADECE sayıyı gönderir. Otomatik çinko hesabı BİTTİ. Artık oyuncu tıklamalı.
          io.to(roomId).emit('number_drawn', { num, drawnNumbers: room.drawnNumbers });
        } else {
          clearInterval(room.intervalId);
          io.to(roomId).emit('game_over', { message: 'Tüm taşlar çekildi!' });
        }
      }, 4000);
    }
  });

  // Oyuncu kendi oyun kartından bir numaraya tıklayıp pul yerleştirdiğinde.
  socket.on('mark_number', ({ roomId, r, c }) => {
     const room = rooms[roomId];
     if (!room) return;
     const player = room.players.find(p => p.id === socket.id);
     if (!player || !player.card) return;

     const num = player.card.grid[r][c];
     // Mantıksal Filtre: Çekilmişler listesinde mi? Numara null mu?
     if (num !== null && room.drawnNumbers.includes(num)) {
         
         // Oyuncunun matrisini İŞARETLENDİ yapıyor
         player.marked[r][c] = true;

         // Anında Satır Doluluk Kontrolü (Hangi satır 5 tane "true" içerecek?)
         let completedRows = 0;
         for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
             // 9 sütunun içine bak, hem sayının kendisi olacak hem de oyuncu onu (player.marked) doğru tıklamış olacak.
             let markedCount = 0;
             for (let col = 0; col < 9; col++) {
                 if (player.card.grid[rowIdx][col] !== null && player.marked[rowIdx][col]) {
                     markedCount++;
                 }
             }
             if (markedCount === 5) completedRows++;
         }

         // "İlk Kazanan Kapar! Rekabet ortamı yaratır"
         if (completedRows === 1 && !room.cinko1Done) {
             room.cinko1Done = true;
             io.to(roomId).emit('win_claimed', { playerName: player.name, type: '1. Çinko' });
         }
         else if (completedRows === 2 && !room.cinko2Done) { // Aynı kişi hem 1 i hem 2 yi tetikleyebilirse diye.
             room.cinko2Done = true;
             io.to(roomId).emit('win_claimed', { playerName: player.name, type: '2. Çinko' });
         }
         else if (completedRows === 3 && !room.tombalaDone) {
             room.tombalaDone = true;
             io.to(roomId).emit('win_claimed', { playerName: player.name, type: 'Tombala' });
             clearInterval(room.intervalId);
             io.to(roomId).emit('game_over', { message: 'Tombala yapıldı! Oyun bitti.' });
         }
     }
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı:', socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        const p = room.players[playerIndex];
        // Ayrılan kişinin kartı varsa kart rafına kilit kaldırılır
        if (p.card) {
           const c = room.availableCards.find(card => card.id === p.card.id);
           if (c) c.owner = null;
        }

        room.players.splice(playerIndex, 1);
        io.to(roomId).emit('player_left', room.players);
        // Odaya ayrılan kişinin kartını sahipsiz olarak yenile
        io.to(roomId).emit('card_selected', { availableCards: room.availableCards, players: room.players });
        
        if (room.players.length === 0) {
          if (room.intervalId) clearInterval(room.intervalId);
          delete rooms[roomId];
        } else if (room.host === socket.id) {
          room.host = room.players[0].id;
          io.to(room.host).emit('you_are_host');
        }
        break;
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} portunda çalışıyor`);
});
