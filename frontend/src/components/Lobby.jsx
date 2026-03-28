import { useState } from 'react';
import { Users, LogIn, Plus } from 'lucide-react';

function Lobby({ socket, onJoin }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert("Lütfen bir oyuncu adı girin!");
      return;
    }
    socket.emit('create_room', { playerName: playerName.trim() }, onJoin);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert("Lütfen bir oyuncu adı girin!");
      return;
    }
    if (!roomCode.trim() || roomCode.length !== 6) {
      alert("Lütfen 6 haneli geçerli bir oda kodu girin!");
      return;
    }
    socket.emit('join_room', { roomId: roomCode.trim(), playerName: playerName.trim() }, onJoin);
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>TOMBALA</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Klasik Yılbaşı Eğlencesi</p>

        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>OYUNCU ADI</label>
          <input
            type="text"
            className="input-field"
            placeholder="Adınızı girin..."
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>

        <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }} onClick={handleCreateRoom}>
          <Plus size={20} /> Yeni Oda Kur
        </button>

        <div style={{ margin: '1.5rem 0', position: 'relative' }}>
          <div style={{ height: '1px', background: 'var(--panel-border)', width: '100%' }}></div>
          <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-color)', padding: '0 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>VEYA</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Oda Kodu"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}
          />
          <button className="btn-secondary" onClick={handleJoinRoom} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
            <LogIn size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lobby;
