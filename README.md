# 🎲 Modern Multiplayer Tombala (Bingo)

![Tombala Gerçek Oynanış Kaydı](./gameplay.webp)

Geleneksel yılbaşı eğlencesi Tombala'nın, React.js ve Node.js (Socket.io) tabanlı modern, gerçek zamanlı ve rekabetçi çok oyunculu (multiplayer) web versiyonu. Bu proje klasik kurallara tamamen sadık kalırken, dijitalin getirdiği interaktif hızla yepyeni bir "İlk tıklayan kapar" rekabeti sunar.

## ✨ Öne Çıkan Özellikler

- **🏠 Gerçek Zamanlı Odalar:** Özel 6 haneli oda kodu ile arkadaşlarınızı davet edebilir, "Host" (Kurucu) olarak oyunu dilediğiniz zaman başlatabilirsiniz.
- **🎨 48 Özel Renkli Kart Seti:** Lobi ekranında 48 farklı renkten oluşan (matematiksel HSL kartları) bir grid üzerinden dilediğiniz kart numarasını ve rengini kimse kapmadan seçin. Kartlar klasik yan (sideways) ID tasarımlarına sahiptir.
- **⚡ Akıllı Çinko & Tombala Hakemi:** Oyuncular kartlarındaki çıkan sayının üzerine tıklayarak, içe göçük/kabartmalı siyah oyun pullarını koyarlar. Sayıyı fiziksel olarak işaretlemediğiniz sürece sistem size Çinko vermez.
- **🥇 İlk Tıklayan Kapar Rekabeti:** Tombalada eğer bir satırın son numarası birden fazla oyuncuda varsa, sayıyı duyduğu an kendi ekranında ona **ilk basan** Çinkoyu garantiler!
- **🚨 Canlı Uyarı ve Duyuru Sistemi:** Çıkmayan numaraya pul koymaya kalktığınızda kırmızı hata uyarısı alırsınız. Her başarılı Çinko/Tombala yeşil neon mesajlarla bütün odaya duyurulur.
- **💎 Glassmorphism Arayüz:** Neon glow parıltıları, yarı saydam cam panelleri ve akıcı css animasyonlarıyla son derece "premium" bir oyun ekranı (Responsive uyumlu).

## 🛠️ Kullanılan Teknolojiler

**Frontend (Kullanıcı Arayüzü):**
- [React](https://reactjs.org/) (Vite ile oluşturuldu)
- Vanilla CSS, CSS Grid, Custom Properties tabanlı dinamik kart algoritması
- Lucide React (Vektörel İkonlar)

**Backend (Sunucu ve Oyun Motoru):**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Socket.io](https://socket.io/) (Çift yönlü canlı websocket iletişimi)

## 🚀 Kurulum & Çalıştırma (Lokalde Test Etmek İçin)

Proje `backend` ve `frontend` olmak üzere iki ayrı servis içerir. Repoyu cihazınıza indirdikten sonra her biri için bir terminal açın.

### 1. Backend (Sunucu) Kurulumu
1. `backend/` klasörüne gidin:
   ```bash
   cd backend
   ```
2. Bağımlılıkları yükleyin ve sunucuyu başlatın:
   ```bash
   npm install
   node server.js
   ```
> *Sunucu `http://localhost:3001` adresinde ayaklanarak bağlantı dinlemeye başlayacaktır.*

### 2. Frontend (Kullanıcı Arayüzü) Kurulumu
1. `frontend/` klasörüne gidin:
   ```bash
   cd frontend
   ```
2. Bağımlılıkları yükleyin ve geliştirici modunda projeyi başlatın:
   ```bash
   npm install
   npm run dev
   ```
> *Tarayıcınızda (genellikle `http://localhost:5173`) uygulamaya erişin.*

*(Öneri: İki farklı tarayıcı penceresi veya biri telefonda girerek oda etkileşimlerini deneyimleyin!)*

## 📄 Oyun Kuralları (Nasıl Oynanır?)
1. Bir oyuncu "Yeni Oda Kur" diyerek lobi açar ve üstteki oda kodunu arkadaşlarına yollar. Davetliler "Odaya Katıl" butonu ile aynı kodu yazarak dâhil olurlar.
2. Odadaki tüm oyuncular, 48 farklı özel tasarım içeren menüden kendi şanslı kartlarını tıklayıp seçerler ve kilitlerler.
3. Herkes kartını seçtikten sonra Kurucu (Host) oyunu başlatır.
4. Sistem her 4 saniyede bir otomatik olarak yeni taş çeker. Tahtadan ziyade "Son Çekilen Taş" alanına ve kendi kartınıza iyi odaklanın!
5. Sayı sizin kartınızda varsa üzerine bir kez tıklayıp **siyah pulu** basmayı unutmayın. Aksi halde çinkonuz onaylanmaz.
6. Bir satırdaki 5 sayıyı başarıyla tamamlarsanız, son taşı koyduğunuz an odadaki herkese zafer anonsu yapılacaktır. 3 satırı ilk bitiren Tombalayı kazanır!
