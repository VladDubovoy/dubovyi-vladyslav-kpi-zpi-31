# MediaShare Blue Pro — вебплатформа для спільного обміну мультимедійним контентом

Оновлена full-stack версія під тему **«Web platform for shared multimedia content exchange»**.
## Студент


## Стек
- Frontend: React + Vite + Zustand + Socket.IO Client
- Backend: Node.js + Express.js + Socket.IO
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Media upload: multer, локальна папка `server/uploads`

> Перший зареєстрований користувач автоматично отримує роль `admin`.

## Реалізовано
- реальний upload фото/відео/аудіо/PDF;
- повна авторизація: реєстрація, логін, JWT, захищені маршрути, ролі;
- пости, лайки, коментарі, скарги;
- Stories з автоматичним закінченням через 24 години;
- Reels з відео, лайками та коментарями;
- чат між користувачами через REST + Socket.IO;
- admin dashboard: статистика, скарги, приховування постів, блокування користувачів;
- синій адаптивний UI/UX дизайн.

## Запуск

### 1. MongoDB
Запустіть MongoDB локально або використайте MongoDB Atlas.

### 2. Backend
```bash
cd server
npm install
```

Створіть файл `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/media_share_platform
JWT_SECRET=super_secret_key_change_me
CLIENT_URL=http://localhost:5173
```

Запуск:
```bash
npm run dev
```

### 3. Frontend
В іншому терміналі:
```bash
cd client
npm install
npm run dev
```

Сайт: `http://localhost:5173`
API: `http://localhost:5000/api`

## Важливо після оновлення
Якщо проєкт уже був відкритий, після заміни файлів виконайте повторно:
```bash
cd server
npm install
cd ../client
npm install
```

Це потрібно, бо додано нові залежності `socket.io` та `socket.io-client`.
