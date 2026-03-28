function getColumnRanges() {
    return [
        { min: 1, max: 9 },      // 0
        { min: 10, max: 19 },    // 1
        { min: 20, max: 29 },    // 2
        { min: 30, max: 39 },    // 3
        { min: 40, max: 49 },    // 4
        { min: 50, max: 59 },    // 5
        { min: 60, max: 69 },    // 6
        { min: 70, max: 79 },    // 7
        { min: 80, max: 90 }     // 8
    ];
}

function getRandomElements(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}

function generateTombalaCard() {
    const card = Array.from({ length: 3 }, () => Array(9).fill(null));
    const columns = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    
    // Her satır için 5 rastgele sütun seç
    const row0Cols = getRandomElements(columns, 5);
    // Orta satırın 0. sütununa sayı GELMEMELİ çünkü orada KART ID olacak.
    const columnsForMiddleRow = [1, 2, 3, 4, 5, 6, 7, 8];
    const row1Cols = getRandomElements(columnsForMiddleRow, 5);
    const row2Cols = getRandomElements(columns, 5);
    
    const colNeeds = Array(9).fill(0);
    row0Cols.forEach(c => colNeeds[c]++);
    row1Cols.forEach(c => colNeeds[c]++);
    row2Cols.forEach(c => colNeeds[c]++);
    
    const ranges = getColumnRanges();
    
    for (let c = 0; c < 9; c++) {
        const needs = colNeeds[c];
        if (needs === 0) continue;
        
        // Bu sütunun aralığındaki sayıları listele
        let pool = [];
        for (let num = ranges[c].min; num <= ranges[c].max; num++) {
            pool.push(num);
        }
        
        // Rastgele `needs` kadar sayı seç ve küçükten büyüğe sırala (yukarıdan aşağı)
        const selectedNums = getRandomElements(pool, needs).sort((a, b) => a - b);
        
        let index = 0;
        if (row0Cols.includes(c)) card[0][c] = selectedNums[index++];
        if (row1Cols.includes(c)) card[1][c] = selectedNums[index++];
        if (row2Cols.includes(c)) card[2][c] = selectedNums[index++];
    }
    
    return card;
}

function generateSequence() {
    // 1'den 90'a kadar sayıları karıştırıp dizi döner
    let sequence = [];
    for (let i = 1; i <= 90; i++) sequence.push(i);
    return getRandomElements(sequence, 90);
}

function generate48Cards() {
    const cards = [];
    for (let i = 1; i <= 48; i++) {
        // Renkler için HSL kullanıp daha canlı ve ayırt edici kıldık
        const hue = Math.floor((i * 360) / 48);
        cards.push({
            id: i,
            color: `hsl(${hue}, 75%, 45%)`,
            grid: generateTombalaCard(),
            owner: null // Hangi soketin aldığı (Kilit durumu)
        });
    }
    return cards;
}

module.exports = {
    generateTombalaCard,
    generateSequence,
    generate48Cards
};
