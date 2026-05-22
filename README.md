# MediaShare Blue Pro — вебплатформа для спільного обміну мультимедійним контентом

Full-stack мультимедійна платформа під тему **«Web platform for shared multimedia content exchange»**.

## Студент
Дубовий Владислав Олегович
Група: ЗПІ-зп-31
Спеціальність: 121 Інженерія програмного забезпечення інформаційних систем

## Огляд

MediaShare Blue Pro — соціальна платформа для обміну медіаконтентом, яка поєднує функціональність стрічки постів (Instagram), історій із 24-годинним терміном життя, коротких відео (Reels), real-time чату й адміністративної панелі модерації. Підтримуються чотири типи медіа: фото, відео, аудіо та PDF. Перший зареєстрований користувач автоматично отримує роль `admin`.

## Стек

### Frontend
- **React 18** — UI-бібліотека, компонентний підхід
- **Vite 5** — bundler із HMR
- **Zustand** — мінімалістичний state management
- **Socket.IO Client** — двосторонній обмін повідомленнями в реальному часі
- **SCSS** — модульні стилі з абстракціями (variables, mixins)
- **Lucide React** — іконки

### Backend
- **Node.js (ES Modules)** — серверне середовище
- **Express.js 4** — HTTP-фреймворк
- **Socket.IO 4** — WebSocket-комунікація
- **Mongoose 8** — ODM для MongoDB
- **jsonwebtoken** — токенна аутентифікація (JWT)
- **bcryptjs** — хешування паролів
- **multer** — обробка `multipart/form-data` для завантаження файлів
- **helmet, cors, morgan** — безпечні заголовки, CORS, логування

### База даних
- **MongoDB** (локально або MongoDB Atlas)

> Перший зареєстрований користувач автоматично отримує роль `admin`.

## Архітектура

```
┌──────────────────┐         REST API           ┌──────────────────┐
│                  │ ─────────────────────────▶ │                  │
│  React Client    │                            │  Express Server  │
│   (Vite, :5173)  │ ◀──── Socket.IO ─────────▶ │     (:5000)      │
│                  │                            │                  │
└──────────────────┘                            └────────┬─────────┘
                                                         │
                                              ┌──────────┴──────────┐
                                              │                     │
                                       ┌──────▼──────┐    ┌─────────▼────────┐
                                       │  MongoDB    │    │  uploads/ (FS)   │
                                       │  (Mongoose) │    │  фото/відео/...  │
                                       └─────────────┘    └──────────────────┘
```

Клієнт надсилає HTTP-запити з JWT у заголовку `Authorization: Bearer <token>`. Для real-time повідомлень встановлюється Socket.IO-з’єднання, авторизація якого виконується через той самий токен у `handshake.auth.token`.

## Структура проєкту

```
dubovyi-vladyslav-kpi-zpi-31/
├── client/                   # React SPA
│   ├── src/
│   │   ├── api/              # HTTP-клієнт (fetch-обгортка з JWT)
│   │   ├── components/       # Перевикористовувані UI-компоненти
│   │   ├── pages/            # Сторінки/перегляди
│   │   ├── store/            # Zustand-стори (auth)
│   │   ├── styles/           # SCSS (abstracts/components/pages)
│   │   ├── App.jsx           # Кореневий компонент із роутингом по view
│   │   └── main.jsx          # Точка входу
│   ├── index.html
│   └── vite.config.js
└── server/                   # Node.js API
    ├── src/
    │   ├── middleware/       # auth.js, upload.js (multer)
    │   ├── models/           # Mongoose-схеми
    │   ├── routes/           # Express-роутери
    │   ├── utils/            # signToken тощо
    │   └── index.js          # Bootstrap + Socket.IO
    └── uploads/              # Локальне сховище медіа
```

## Реалізовано

- реальний upload фото/відео/аудіо/PDF;
- повна авторизація: реєстрація, логін, JWT, захищені маршрути, ролі;
- пости, лайки, коментарі, скарги;
- Stories з автоматичним закінченням через 24 години;
- Reels з відео, лайками та коментарями;
- чат між користувачами через REST + Socket.IO;
- admin dashboard: статистика, скарги, приховування постів, блокування користувачів;
- синій адаптивний UI/UX дизайн.

## API маршрути

Префікс для всіх — `/api`. Маршрути, позначені **(auth)**, потребують заголовка `Authorization: Bearer <token>`. **(admin)** — лише для користувачів із роллю `admin`.

### Auth — `/api/auth`
| Метод | Шлях | Тіло / Параметри | Опис |
|---|---|---|---|
| POST | `/register` | `{ name, email, password }` | Реєстрація (пароль ≥6 символів). Повертає `{ user, token }`. |
| POST | `/login` | `{ email, password }` | Вхід. Повертає `{ user, token }`. |
| GET (auth) | `/me` | — | Профіль поточного користувача. |

### Posts — `/api/posts`
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/?q=&tag=&page=` | Стрічка публічних постів із пошуком і пагінацією (12/сторінку). |
| POST (auth) | `/` | Створити пост; `multipart/form-data`, поле `media` (до 5 файлів). |
| GET | `/:id` | Один пост зі співавторами коментарів. |
| PATCH (auth) | `/:id` | Редагувати власний пост (адмін — будь-який). |
| DELETE (auth) | `/:id` | Видалити власний пост. |
| POST (auth) | `/:id/like` | Toggle лайка. |
| POST (auth) | `/:id/comments` | Додати коментар: `{ text }`. |
| POST (auth) | `/:id/report` | Поскаржитися: `{ reason }`. |

### Stories — `/api/stories`
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/` | Активні (не прострочені) історії. |
| POST (auth) | `/` | Створити (`multipart`, поле `media`, одне фото/відео). |
| POST (auth) | `/:id/view` | Зарахувати перегляд. |
| DELETE (auth) | `/:id` | Видалити власну історію. |

### Reels — `/api/reels`
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/?q=` | Стрічка reels (до 30). |
| POST (auth) | `/` | Створити; `multipart`, поле `video`. |
| POST (auth) | `/:id/like` | Toggle лайка. |
| POST (auth) | `/:id/comments` | Додати коментар. |

### Chat — `/api/chat`
| Метод | Шлях | Опис |
|---|---|---|
| GET (auth) | `/users` | Список користувачів для чату. |
| GET (auth) | `/messages/:userId` | Історія повідомлень із користувачем (до 100). |
| POST (auth) | `/messages/:userId` | Надіслати; емітить `new-message` через Socket.IO обом сторонам. |

### Users — `/api/users`
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/:id` | Профіль користувача + його публічні пости. |
| PATCH (auth) | `/me` | Оновити власні `name`, `bio`, `avatar`. |
| POST (auth) | `/:id/follow` | Toggle підписки. |

### Admin — `/api/admin` (всі — auth + admin)
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/stats` | Кількість користувачів, постів, прихованих, скарг, історій, reels, повідомлень. |
| GET | `/reports` | Пости зі скаргами. |
| GET | `/users` | Останні 100 користувачів. |
| PATCH | `/posts/:id/status` | Приховати/відновити пост. |
| PATCH | `/users/:id/block` | Заблокувати/розблокувати користувача. |
| PATCH | `/reels/:id/status` | Приховати/відновити reel. |

### Системні
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/api/health` | Health-check; `{ ok: true, service: "MediaShare API Pro" }`. |
| GET | `/uploads/<file>` | Статика — завантажені медіа. |

## Моделі даних

### User — [server/src/models/User.js](server/src/models/User.js)
| Поле | Тип | Примітка |
|---|---|---|
| `name` | String | required, trim |
| `email` | String | required, unique, lowercase |
| `passwordHash` | String | bcrypt, 10 rounds |
| `avatar`, `bio` | String | optional |
| `role` | enum: `user`, `admin` | за замовчуванням `user` |
| `isBlocked` | Boolean | блокування адміністратором |
| `followers`, `following` | [ObjectId&lt;User&gt;] | взаємні підписки |
| `createdAt`, `updatedAt` | Date | автоматичні (`timestamps: true`) |

Метод `user.safe()` повертає документ без `passwordHash`.

### Post — [server/src/models/Post.js](server/src/models/Post.js)
| Поле | Тип | Примітка |
|---|---|---|
| `author` | ObjectId&lt;User&gt; | required |
| `title` | String, ≤120 | required |
| `description` | String, ≤1500 | |
| `tags` | [String, lowercase] | |
| `visibility` | enum: `public`, `private` | за замовчуванням `public` |
| `media` | [MediaSchema] | `url`, `type` (`image`/`video`/`audio`/`file`), `originalName`, `size` |
| `likes` | [ObjectId&lt;User&gt;] | |
| `comments` | [{ author, text ≤500, createdAt }] | вкладений масив |
| `reports` | [{ user, reason }] | |
| `status` | enum: `active`, `hidden` | модерація |

### Story — [server/src/models/Story.js](server/src/models/Story.js)
- одне `media` (фото або відео);
- `caption` ≤300;
- `viewers: [ObjectId<User>]`;
- `expiresAt` із **TTL-індексом** (`expires: 0`) — MongoDB автоматично видаляє документ через 24 години після часу `expiresAt`.

### Reel — [server/src/models/Reel.js](server/src/models/Reel.js)
- лише `video` (multer перевіряє mimetype);
- `title` (required ≤120), `description` ≤800, `tags`;
- `likes`, `comments` за схемою як у Post.

### Message — [server/src/models/Message.js](server/src/models/Message.js)
- `sender`, `receiver` (ObjectId&lt;User&gt;);
- `text` ≤1000;
- `read: Boolean`;
- `timestamps`.

## Аутентифікація та авторизація

1. **Реєстрація / Логін** → сервер хешує пароль (bcrypt, 10 rounds), створює JWT з payload `{ id, role }` і строком життя 7 днів.
2. **Захищені маршрути** проходять middleware `auth` ([server/src/middleware/auth.js](server/src/middleware/auth.js)):
   - читає токен із `Authorization: Bearer <token>`;
   - верифікує підпис ключем `JWT_SECRET`;
   - підвантажує користувача з БД;
   - відмовляє, якщо користувач заблокований (`isBlocked`).
3. **Адміністративні маршрути** додатково проходять middleware `admin`, що перевіряє `req.user.role === "admin"`.
4. **Перший користувач** — у `POST /api/auth/register`, якщо `User.countDocuments() === 0`, нова роль автоматично виставляється у `admin`.
5. **Socket.IO** — токен передається в `handshake.auth.token`; невалідний токен або заблокований користувач отримують помилку з’єднання та відключаються.

## Real-time комунікація

- Сервер запускає `socket.io` поверх HTTP-сервера ([server/src/index.js](server/src/index.js)).
- На підключенні користувач приєднується до власної кімнати з ім’ям свого `_id`.
- При надсиланні повідомлення (`POST /api/chat/messages/:userId`) сервер емітить подію `new-message` обом учасникам у відповідні кімнати.
- Клієнт ([client/src/pages/ChatPage.jsx](client/src/pages/ChatPage.jsx)) слухає `new-message` і оновлює UI без перезавантаження.

## Завантаження медіафайлів

- Реалізовано через **multer** ([server/src/middleware/upload.js](server/src/middleware/upload.js)).
- Зберігання: локальна папка `server/uploads/` (створюється автоматично при першому запуску).
- Ім’я файлу: `<timestamp>-<random>.<ext>` для уникнення колізій.
- Обмеження: до **50 MB** на файл, до **5 файлів** на запит.
- Дозволені MIME-типи: `image/*`, `video/*`, `audio/*`, `application/pdf`.
- Доступ до файлів — через `GET /uploads/<filename>` (Express static).

## Безпека

- **bcrypt** для паролів (10 rounds salt).
- **JWT** із обов’язковим `JWT_SECRET`; сервер не стартує, якщо змінна не задана.
- **helmet** для безпечних HTTP-заголовків (з `crossOriginResourcePolicy: cross-origin` для віддачі медіа клієнту).
- **CORS** обмежено доменом `CLIENT_URL`.
- **Mongoose** типізовані схеми + ліміти довжин (`maxlength`) обмежують зловживання введенням.
- **Стек middleware** `auth` → `admin` для приватних і адмінських дій.
- **Multer fileFilter** відсіює небажані типи файлів за MIME.

**Рекомендації для продакшн-розгортання**: додати rate limiting (`express-rate-limit`), вхідну валідацію (`zod`/`express-validator`), перевірку magic-bytes завантажених файлів, винесення `uploads/` у зовнішнє сховище (S3, Cloudinary), повторну спробу підключення до Mongo.

## Змінні середовища

Файл `server/.env` (зразок у `server/.env.example`):

| Змінна | Обов’язкова | Приклад | Опис |
|---|---|---|---|
| `PORT` | ні | `5000` | Порт сервера. |
| `MONGO_URI` | **так** | `mongodb://127.0.0.1:27017/media_share_platform` | Рядок підключення до MongoDB. |
| `JWT_SECRET` | **так** | `super_secret_key_change_me` | Ключ підпису JWT. |
| `CLIENT_URL` | ні | `http://localhost:5173` | URL фронтенду для CORS. |

Сервер відмовляється стартувати, якщо `MONGO_URI` або `JWT_SECRET` не задані.

Для фронтенду — `VITE_API_URL` (опційно; за замовчуванням `http://localhost:5000/api`).

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
MONGO_URI=mongodb+srv://vladdubovoy15_db_user:<db_password>@cluster0.hfe1hfh.mongodb.net/?appName=Cluster0
JWT_SECRET=super_secret_key_change_me
CLIENT_URL=http://localhost:5173
```

Запуск:
```bash
npm run dev     # nodemon з hot reload
# або
npm start       # звичайний запуск
```

### 3. Frontend
В іншому терміналі:
```bash
cd client
npm install
npm run dev
```

- Сайт: `http://localhost:5173`
- API: `http://localhost:5000/api`

## Скрипти

### Backend (`server/`)
| Скрипт | Призначення |
|---|---|
| `npm run dev` | Запуск із nodemon (auto-restart). |
| `npm start` | Звичайний запуск через node. |

### Frontend (`client/`)
| Скрипт | Призначення |
|---|---|
| `npm run dev` | Vite dev-сервер на `:5173`. |
| `npm run build` | Продакшн-збірка у `dist/`. |
| `npm run preview` | Перегляд продакшн-збірки локально. |

## Важливо після оновлення
Якщо проєкт уже був відкритий, після заміни файлів виконайте повторно:
```bash
cd server
npm install
cd ../client
npm install
```

Це потрібно, бо додано нові залежності `socket.io` та `socket.io-client`.
