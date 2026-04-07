# Leave Management System — Full Stack

## 📁 Project Structure
```
leave-management-fullstack/
├── frontend/          ← React + Vite + Tailwind (your existing UI)
├── backend/           ← Express.js + MySQL REST API
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+ → https://nodejs.org
- **MySQL** 8.0+ → https://dev.mysql.com/downloads/
- **VS Code** → https://code.visualstudio.com

### Step 1: Extract the ZIP
1. Download and extract `leave-management-fullstack.zip`
2. Open the extracted folder in VS Code:
   ```bash
   cd leave-management-fullstack
   code .
   ```

### Step 2: Setup MySQL Database
1. Start MySQL server
2. Open a terminal and note your MySQL root password

### Step 3: Setup Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=leave_management
JWT_SECRET=any_random_secret_string
PORT=3001
```

Install dependencies and setup database:
```bash
npm install
npm run db:setup    # Creates tables + seeds demo data
npm run dev         # Starts backend on http://localhost:3001
```

### Step 4: Setup Frontend
Open a NEW terminal:
```bash
cd frontend
npm install
npm run dev         # Starts frontend on http://localhost:5173
```

### Step 5: Open the App
Visit **http://localhost:5173** in your browser.

### 🔑 Demo Login Credentials
| Role      | Email                     | Password  |
|-----------|---------------------------|-----------|
| Principal | principal@college.edu     | admin123  |
| HOD       | hod.cs@college.edu        | hod123    |
| Faculty   | faculty1@college.edu      | fac123    |
| Student   | student1@college.edu      | stu123    |

## 📡 API Endpoints

| Method | Endpoint                          | Description            |
|--------|-----------------------------------|------------------------|
| POST   | /api/auth/login                   | Login                  |
| GET    | /api/users                        | List all users         |
| POST   | /api/users                        | Add new user           |
| GET    | /api/leaves                       | List all leaves        |
| GET    | /api/leaves/user/:id              | User's leaves          |
| GET    | /api/leaves/pending?role=&dept=   | Pending approvals      |
| POST   | /api/leaves                       | Apply leave            |
| PUT    | /api/leaves/:id/approve           | Approve leave          |
| PUT    | /api/leaves/:id/reject            | Reject leave           |
| GET    | /api/audit                        | Audit logs             |
| GET    | /api/notifications/:userId        | User notifications     |
| PUT    | /api/notifications/:id/read       | Mark read              |
| PUT    | /api/notifications/:userId/read-all | Mark all read        |

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Zustand, Framer Motion, Recharts
- **Backend**: Express.js, MySQL2, bcryptjs, jsonwebtoken
- **Database**: MySQL 8.0

## 💡 Notes
- The frontend currently uses Zustand local store. To switch to the API backend, replace store calls with the `api` service in `frontend/src/services/api.ts`.
- Both can run simultaneously — the Vite dev server proxies `/api` requests to the backend.
