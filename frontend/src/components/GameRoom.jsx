import { useState, useEffect } from 'react';
import BingoCard from './BingoCard';
import DrawnNumbersBoard from './DrawnNumbersBoard';
import { Play, Loader2 } from 'lucide-react';

function GameRoom({ socket, roomData, onCardSelected }) {
  const [drawnNum, setDrawnNum] = useState(null);
  const [drawnList, setDrawnList] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [started, setStarted] = useState(roomData.started);

  useEffect(() => {
    socket.on('number_drawn', (data) => {
      setDrawnNum(data.num);
      setDrawnList(data.drawnNumbers);
    });

    socket.on('win_claimed', (data) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, msg: `${data.playerName} ${data.type} yaptı! 🎉` }]);
      setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 5000);
    });

    socket.on('game_over', (data) => alert(data.message));
    socket.on('game_started', () => setStarted(true));
    socket.on('error_notification', (msg) => alert(msg));

    return () => {
      socket.off('number_drawn');
      socket.off('win_claimed');
      socket.off('game_over');
      socket.off('game_started');
      socket.off('error_notification');
    };
  }, [socket]);

  const handleStart = () => socket.emit('start_game', roomData.roomId);

  const handleWarning = () => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg: 'Bu sayı henüz çıkmadı!', bg: 'rgba(239, 68, 68, 0.9)' }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  const handleSelectCard = (cardId) => {
    socket.emit('select_card', { roomId: roomData.roomId, cardId }, (response) => {
      if (response.success) onCardSelected(response.card);
      else alert(response.message || 'Kart alınamadı!');
    });
  };

  // 1) OYUN BAŞLAMADIYSA LOBİ VE KART SEÇİM EKRANINI GÖSTER
  if (!started) {
    const allPlayersReady = roomData.players.every(p => p.card !== null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
           <div>
              <h2 style={{ margin: 0, color: 'var(--primary)' }}>Hazırlık Lobisi | {roomData.roomId}</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Odada <b>{roomData.players.length}</b> oyuncu var. Lütfen bir kart rengi ve ID'si seçin.
              </p>
           </div>
           
           <div>
             {roomData.isHost ? (
               <button 
                  className="btn-primary" 
                  onClick={handleStart} 
                  disabled={!allPlayersReady} 
                  style={{ opacity: allPlayersReady ? 1 : 0.5 }}
               >
                 <Play size={20} /> {allPlayersReady ? 'Oyunu Başlat' : 'Herkes Kart Seçmeli'}
               </button>
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                 <Loader2 className="lucide-spin" size={20} style={{ animation: 'spin 2s linear infinite' }} /> 
                 Host'un başlatması bekleniyor...
               </div>
             )}
           </div>
        </div>

        <div className="glass-panel">
           <h3 style={{ marginTop: 0 }}>48 Farklı Renkten Kartını Seç</h3>
           {roomData.card && <p style={{ color: '#22c55e', fontWeight: 'bold' }}>Seçtiğiniz Kart ID: {roomData.card.id}</p>}
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px', marginTop: '1.5rem' }}>
              {roomData.availableCards.map(c => {
                 const isMine = roomData.card && roomData.card.id === c.id;
                 const isTaken = c.owner !== null && !isMine;
                 return (
                   <div 
                     key={c.id} 
                     onClick={() => !isTaken && handleSelectCard(c.id)}
                     style={{
                       background: isTaken ? '#1e293b' : c.color,
                       opacity: isTaken ? 0.3 : 1,
                       cursor: isTaken ? 'not-allowed' : 'pointer',
                       height: '80px',
                       borderRadius: '8px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       fontSize: '1.5rem',
                       fontWeight: '800',
                       color: 'white',
                       border: isMine ? '4px solid white' : '1px solid transparent',
                       boxShadow: isMine ? '0 0 20px rgba(255,255,255,0.6)' : (isTaken ? 'none' : '0 4px 6px rgba(0,0,0,0.3)'),
                       transition: 'all 0.2s'
                     }}
                   >
                     {c.id}
                   </div>
                 );
              })}
           </div>
        </div>
      </div>
    );
  }

  // 2) OYUN BAŞLADIYSA GERÇEK OYUN EKRANI
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Üst Kısım: Başlık, Durum */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--primary)' }}>Yılbaşı Tombalası | {roomData.roomId}</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>
            Oyun Canlı. Çıkan sayıları tıklayarak işaretlemeyi unutma! Pulu sen koymazsan Çinko yapamazsın.
          </p>
        </div>
      </div>

      {/* Bildirim Alanı */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map(notif => (
          <div key={notif.id} className="glass-panel" style={{ background: notif.bg || 'rgba(34, 197, 94, 0.9)', color: 'white', border: `1px solid ${notif.bg ? '#b91c1c' : '#16a34a'}`, padding: '1rem', minWidth: '250px', animation: 'slideIn 0.3s ease-out' }}>
            {notif.msg}
          </div>
        ))}
      </div>

      {/* Büyük Tombala Kartı ve Son Çekilen Taş */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <h3 style={{ marginBottom: 0 }}>Tombala Kartın (ID: {roomData.card.id})</h3>
        
        {/* Soket objesini de geçiriyoruz ki BingoCard sunucuya mark yapıldığını iletebilsin */}
        <BingoCard 
            roomId={roomData.roomId}
            socket={socket}
            card={roomData.card} 
            drawnNumbers={drawnList} 
            onWarning={handleWarning} 
        />

        {drawnNum !== null && (
           <div style={{ background: 'var(--panel-bg)', border: `2px solid ${roomData.card.color}`, padding: '15px 30px', borderRadius: '12px', textAlign: 'center', marginTop: '1rem', width: '100%', maxWidth: '900px', boxShadow: `0 0 20px ${roomData.card.color}40` }}>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: '600' }}>SON ÇEKİLEN TAŞ</div>
              <div style={{ color: 'var(--primary)', fontSize: '4.5rem', fontWeight: '800', lineHeight: '1', textShadow: '0 0 20px rgba(249, 115, 22, 0.6)' }}>
                 {drawnNum}
              </div>
           </div>
        )}
      </div>

      <DrawnNumbersBoard drawnNumbers={drawnList} />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default GameRoom;
