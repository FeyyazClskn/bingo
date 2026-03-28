import './DrawnNumbersBoard.css';

function DrawnNumbersBoard({ drawnNumbers }) {
  // 1'den 90'a kadar bir dizi oluştur
  const numbers = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="board-wrapper glass-panel">
      <h3 style={{ marginTop: 0, textAlign: 'center', color: 'var(--text-muted)' }}>ÇEKİLEN TAŞLAR</h3>
      <div className="board-container">
        {numbers.map(num => {
          const isDrawn = drawnNumbers.includes(num);
          const isLatest = drawnNumbers[drawnNumbers.length - 1] === num;
          
          return (
            <div 
              key={num} 
              className={`board-cell ${isDrawn ? 'drawn' : ''} ${isLatest ? 'latest' : ''}`}
            >
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DrawnNumbersBoard;
