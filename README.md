# FreelanceFlow

A modern, production-ready full-stack web application for managing freelance projects and tasks.

## 🚀 Features

- **Frontend**: React + TypeScript with Vite, Tailwind CSS, React Router
- **Backend**: Node.js + Express with Prisma ORM, JWT Auth, PostgreSQL
- **State Management**: Zustand for frontend state
- **Charts**: Recharts for data visualization
- **Dark Mode**: Full dark theme support with Tailwind CSS
- **Security**: JWT authentication with bcrypt password hashing
- **Database**: PostgreSQL with Prisma migrations

## 📋 Project Structure

```
FreelanceFlow/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (Login, Dashboard, etc.)
│   │   ├── layouts/       # Layout components
│   │   ├── services/      # API services & axios
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript type definitions
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/               # Node.js + Express backend
│   ├── controllers/       # Business logic handlers
│   ├── routes/            # API route definitions
│   ├── middleware/        # Express middleware (auth, error handling)
│   ├── services/          # Service layer for database operations
│   ├── utils/             # Utility functions (JWT, error handling)
│   ├── prisma/
│   │   ├── schema.prisma  # Prisma database schema
│   │   └── seed.js        # Database seeding script
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env.example
│
├── database/              # Database files
│   ├── schema.sql         # SQL schema reference
│   └── seed.sql           # Seeding SQL (optional)
│
└── README.md

```

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS framework with dark mode
- **React Router 6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Charts & visualizations

### Backend
- **Express.js** - Web framework
- **Node.js** - JavaScript runtime
- **Prisma** - ORM for database management
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL (v12+)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/freelanceflow
   JWT_SECRET=your_secret_key_here
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Setup database:**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Start frontend dev server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🔐 Authentication

### Login Credentials (after seeding)
- **Client Account:**
  - Email: `client@example.com`
  - Password: `password123`

- **Freelancer Account:**
  - Email: `freelancer@example.com`
  - Password: `password123`

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Health status

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Projects (All protected)
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🗄️ Database Schema

### Users Table
- `id` - UUID
- `email` - Unique
- `password` - Hashed
- `name` - Full name
- `role` - 'client' | 'freelancer' | 'admin'
- `avatar` - Profile picture URL
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Projects Table
- `id` - UUID
- `title` - Project name
- `description` - Project details
- `status` - 'open' | 'in-progress' | 'completed' | 'cancelled'
- `budget` - Project price
- `deadline` - Due date
- `clientId` - FK to Users
- `freelancerId` - FK to Users (nullable)
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

### Tasks Table
- `id` - UUID
- `title` - Task name
- `description` - Task details
- `status` - 'todo' | 'in-progress' | 'done'
- `priority` - 'low' | 'medium' | 'high'
- `dueDate` - Due date (nullable)
- `projectId` - FK to Projects
- `createdAt` - Timestamp
- `updatedAt` - Timestamp

## 🎨 Frontend Features

### Pages
1. **Login** (`/login`) - User authentication
2. **Signup** (`/signup`) - User registration
3. **Dashboard** (`/dashboard`) - Main application dashboard

### Components
- **BaseLayout** - Main layout with navigation and footer
- **LoadingSpinner** - Loading indicator
- **ErrorAlert** - Error notification
- **SuccessAlert** - Success notification

### Tailwind CSS Theme
- **Dark Mode**: Enabled via `dark:` prefix classes
- **Colors**: Primary (cyan), Secondary (purple), with full slate palette
- **Custom Components**: `.btn-primary`, `.btn-secondary`, `.input-field`, `.card`

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on hosting platform
2. Run database migrations: `npx prisma migrate deploy`
3. Deploy to platforms like Heroku, Railway, or Fly.io

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `dist` folder to Vercel, Netlify, or any static host

## 📚 Available Scripts

### Backend
```bash
npm run dev              # Start dev server with auto-reload
npm start              # Start production server
npm run prisma:push    # Sync schema to database
npm run prisma:generate # Generate Prisma client
npm run prisma:seed     # Seed database with sample data
npm run prisma:studio   # Open Prisma Studio GUI
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ CORS configuration
- ✅ Protected API routes
- ✅ Input validation
- ✅ Error handling
- ✅ SQL injection prevention (via Prisma)

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
# Verify DATABASE_URL in .env
# Test connection: psql <DATABASE_URL>
```

### Port Already in Use
```bash
# Backend (5000): npx kill-port 5000
# Frontend (5173): npx kill-port 5173
```

### Prisma Migration Issues
```bash
npm run prisma:push --force-reset
```

## 📝 License

MIT License - Feel free to use this project as a template!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for freelance project management**
