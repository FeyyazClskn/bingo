import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import './index.css';

// Socket.io sunucusuna bağlan
const socket = io('http://localhost:3001');

function App() {
  const [gameState, setGameState] = useState('lobby'); 
  const [roomData, setRoomData] = useState(null);

  useEffect(() => {
    socket.on('player_joined', (players) => {
      setRoomData(prev => prev ? { ...prev, players } : prev);
    });
    
    socket.on('player_left', (players) => {
      setRoomData(prev => prev ? { ...prev, players } : prev);
    });

    socket.on('you_are_host', () => {
      setRoomData(prev => prev ? { ...prev, isHost: true } : prev);
    });

    socket.on('game_started', () => {
      setRoomData(prev => prev ? { ...prev, started: true } : prev);
    });

    // Herhangi biri (kullanıcı veya başkası) kart seçtiğinde mevcut durumu güncelle.
    socket.on('card_selected', (data) => {
      setRoomData(prev => prev ? { ...prev, availableCards: data.availableCards, players: data.players } : prev);
    });

    return () => {
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('you_are_host');
      socket.off('game_started');
      socket.off('card_selected');
    };
  }, []);

  const handleJoinResponse = (data) => {
    if (data.success) {
      setRoomData({
        roomId: data.roomId,
        card: null, // Yeni sunucu mantığına göre oyuncular ilk girişte kart sahibi değildir (0.aşama)
        isHost: data.isHost,
        players: data.players,
        availableCards: data.availableCards,
        started: false
      });
      setGameState('room');
    } else {
      alert(data.message || 'Bir hata oluştu!');
    }
  };

  // Kartı başarıyla "kendisi" üstüne alan tarayıcının tetikleyicisi
  const handleCardSelectedLocally = (card) => {
      setRoomData(prev => prev ? { ...prev, card } : prev);
  };

  return (
    <>
      {gameState === 'lobby' ? (
        <Lobby socket={socket} onJoin={handleJoinResponse} />
      ) : (
        <GameRoom socket={socket} roomData={roomData} onCardSelected={handleCardSelectedLocally} />
      )}
    </>
  );
}

export default App;
