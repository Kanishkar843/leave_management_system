# Environment Variables for Vercel Deployment

## JWT Secret
```
JWT_SECRET=leave_management_jwt_secret_2024_secure_random_string_kanishkar843_super_secret_key_123456789
```

## Database Host Options

### Option 1: Vercel MySQL (Recommended)
```
DB_HOST=mysql-vercel-host.com
DB_PORT=3306
DB_USER=vercel_user
DB_PASSWORD=your_vercel_mysql_password
DB_NAME=leave_management
```

### Option 2: PlanetScale (Free MySQL)
1. Sign up at https://planetscale.com/
2. Create new database: `leave_management`
3. Get connection details:
```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your_planetscale_username
DB_PASSWORD=your_planetscale_password
DB_NAME=leave_management
```

### Option 3: Railway (MySQL)
1. Sign up at https://railway.app/
2. Add MySQL service
3. Get connection details:
```
DB_HOST=containers.us-west-2.railway.app
DB_PORT=3306
DB_USER=railway
DB_PASSWORD=your_railway_password
DB_NAME=leave_management
```

### Option 4: Local/External MySQL
```
DB_HOST=localhost  # or your MySQL server IP
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=leave_management
```

## Quick Setup with PlanetScale (Free & Easy)

1. **Create PlanetScale Account**:
   - Go to https://planetscale.com/
   - Sign up with GitHub

2. **Create Database**:
   - Click "New Database"
   - Name: `leave_management`
   - Region: Choose closest to your users

3. **Get Connection Details**:
   - Go to database → "Connect"
   - Select "@vercel/node" framework
   - Copy the connection string

4. **Add to Vercel**:
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add all variables above

## Complete Environment Variables for Vercel

```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your_planetscale_username
DB_PASSWORD=your_planetscale_password
DB_NAME=leave_management
JWT_SECRET=leave_management_jwt_secret_2024_secure_random_string_kanishkar843_super_secret_key_123456789
```

## Database Setup Script

After setting up your database, run this SQL to create tables:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
  department VARCHAR(100),
  employee_id VARCHAR(50),
  roll_number VARCHAR(50),
  designation VARCHAR(100),
  added_by INT,
  ml_balance INT DEFAULT 12,
  cl_balance INT DEFAULT 12,
  od_balance INT DEFAULT 6,
  el_balance INT DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  leave_type ENUM('ML', 'CL', 'OD', 'EL') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by INT,
  approved_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Admin User Setup

Insert an admin user (password: `admin123`):

```sql
INSERT INTO users (name, email, password, role, department, employee_id, designation, ml_balance, cl_balance, od_balance, el_balance) 
VALUES (
  'Admin User',
  'admin@leave-management.com',
  '$2a$10$rQ8KqYqGqQqQqQqQqQqQqOqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQq',
  'admin',
  'IT',
  'ADMIN001',
  'System Administrator',
  12, 12, 6, 30
);
```

## Testing

After deployment, test:
- Frontend: `https://your-app.vercel.app`
- API Health: `https://your-app.vercel.app/api/health`
