import { useState } from 'react';
import './BingoCard.css';

function BingoCard({ card, drawnNumbers, onWarning, socket, roomId }) {
  // 3x9 grid, her bir hücrenin işaretlenip işaretlenmediğini tutan state
  const [marked, setMarked] = useState(
    Array(3).fill().map(() => Array(9).fill(false))
  );

  const toggleMark = (r, c) => {
    // Yalnızca sayı olan hücreler işleme girebilir
    if (card.grid[r][c] !== null) {
      
      // Çekilen listede bu sayı var mı?
      if (drawnNumbers.includes(card.grid[r][c])) {
        const newMarked = [...marked];
        newMarked[r] = [...newMarked[r]];
        newMarked[r][c] = !newMarked[r][c];
        setMarked(newMarked);
        
        // Eğer pul koyuluyorsa (kaldırılmıyorsa) sunucuya anında onaya yollayalım ki Çinko denetimi yapsın.
        if (newMarked[r][c] && socket) {
            socket.emit('mark_number', { roomId, r, c });
        }

      } else {
        // Sayı listede yoksa kırmızı uyarı döndür
        if (onWarning) onWarning();
      }
    }
  };

  return (
    // CSS içerisindeki var(--card-bg) dinamik rengini "style" üzerinden karta enjekte ediyoruz
    <div className="bingo-card" style={{ '--card-bg': card.color }}>
       {/* Klasik 15 Sayılık 3x9 Gözlü Kısım */}
       <div className="card-grid">
         {card.grid.map((row, r) => (
           <div key={r} className="bingo-row">
             {row.map((num, c) => {
               // Eğer 2. Satır, 1. Sütun (İndex: r=1, c=0) ise burası Kart ID alanıdır.
               if (r === 1 && c === 0) {
                 return (
                   <div key={c} className="bingo-cell id-cell">
                     <span>{card.id}</span>
                   </div>
                 );
               }

               const hasNum = num !== null;
               return (
                 <div 
                   key={c} 
                   className={`bingo-cell ${hasNum ? 'has-number' : 'is-empty'}`}
                   onClick={() => toggleMark(r, c)}
                 >
                   {hasNum ? num : ''}
                   {hasNum && marked[r][c] && (
                     <div className="marker-token">{num}</div>
                   )}
                 </div>
               );
             })}
           </div>
         ))}
       </div>

    </div>
  );
}

export default BingoCard;
