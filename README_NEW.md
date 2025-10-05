# Healthcare Admin Dashboard

Hệ thống quản trị cho ứng dụng Healthcare với giao diện admin (Frontend) và API server (Backend).

## 🚀 Cách chạy dự án

### Cài đặt dependencies

```bash
# Cài đặt dependencies cho cả frontend và backend
npm run install:all
```

### Chạy Frontend Admin (React + Vite)

```bash
npm run dev
```
- Chạy trên: `http://localhost:5173`
- Hot reload được kích hoạt cho development

### Chạy Backend API Server

```bash
npm start
```
- Chạy trên: `http://localhost:5000`
- API endpoints: `/api/facilities`, `/api/facilities/search`

### Chạy Backend trong Development mode

```bash
npm run dev:backend
```
- Sử dụng nodemon để auto-restart khi có thay đổi

## 📁 Cấu trúc dự án

```
healthcare-admin/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript definitions
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── assets/            # Static assets
├── backend/               # Backend API Server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models
│   ├── utils/             # Utility functions
│   ├── server.js          # Main server file
│   ├── db.js              # Database connection
│   └── .env               # Environment variables
└── public/                # Public assets
```

## 🔧 Cấu hình

### Backend (.env)
```
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=healthcareDB
DB_PASSWORD=123456
DB_PORT=5432
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Healthcare Admin
```

## 📡 API Endpoints

- `GET /` - Server status
- `GET /api/facilities` - Lấy tất cả cơ sở y tế
- `GET /api/facilities/:id` - Lấy chi tiết cơ sở y tế
- `GET /api/facilities/search` - Tìm kiếm cơ sở y tế

## 🛠 Scripts

- `npm run dev` - Chạy frontend development server
- `npm start` - Chạy backend production server
- `npm run dev:backend` - Chạy backend development server
- `npm run install:all` - Cài đặt dependencies cho cả FE và BE
- `npm run build` - Build frontend cho production
- `npm run preview` - Preview production build

## 📦 Dependencies

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- ESLint (code quality)

### Backend
- Express.js (web framework)
- PostgreSQL (database)
- CORS (cross-origin resource sharing)
- dotenv (environment variables)
- nodemon (development auto-restart)