const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const db = process.env.DB_NAME || 'leave_management';
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``);
  await conn.query(`USE \`${db}\``);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('principal','hod','faculty','student') NOT NULL,
      department VARCHAR(100) NOT NULL,
      employee_id VARCHAR(50),
      roll_number VARCHAR(50),
      designation VARCHAR(100),
      added_by VARCHAR(36),
      ml_balance INT DEFAULT 12,
      cl_balance INT DEFAULT 8,
      od_balance INT DEFAULT 5,
      el_balance INT DEFAULT 15,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS leaves (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      user_name VARCHAR(100) NOT NULL,
      user_role ENUM('principal','hod','faculty','student') NOT NULL,
      department VARCHAR(100) NOT NULL,
      type ENUM('ML','CL','OD','EL') NOT NULL,
      reason TEXT NOT NULL,
      from_date DATE NOT NULL,
      to_date DATE NOT NULL,
      status ENUM('pending','approved_by_faculty','approved_by_hod','approved','rejected') DEFAULT 'pending',
      proof_url VARCHAR(500),
      rejection_reason TEXT,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS approval_chain (
      id INT AUTO_INCREMENT PRIMARY KEY,
      leave_id VARCHAR(36) NOT NULL,
      role ENUM('faculty','hod','principal') NOT NULL,
      action ENUM('pending','approved','rejected') DEFAULT 'pending',
      actor_id VARCHAR(36),
      actor_name VARCHAR(100),
      remarks TEXT,
      timestamp TIMESTAMP NULL,
      FOREIGN KEY (leave_id) REFERENCES leaves(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(36) PRIMARY KEY,
      actor_id VARCHAR(36) NOT NULL,
      actor_name VARCHAR(100) NOT NULL,
      actor_role ENUM('principal','hod','faculty','student') NOT NULL,
      action VARCHAR(100) NOT NULL,
      target_id VARCHAR(36),
      target_name VARCHAR(100),
      remarks TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info','success','warning','error') DEFAULT 'info',
      \`read\` BOOLEAN DEFAULT FALSE,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Seed default users
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');

  const users = [
    { id: 'p1', name: 'Dr. Ramesh Kumar', email: 'principal@college.edu', password: 'admin123', role: 'principal', department: 'Administration' },
    { id: 'h1', name: 'Dr. Anita Sharma', email: 'hod.cs@college.edu', password: 'hod123', role: 'hod', department: 'Computer Science', employee_id: 'HOD-CS-001', added_by: 'p1' },
    { id: 'h2', name: 'Dr. Vikram Patel', email: 'hod.ece@college.edu', password: 'hod123', role: 'hod', department: 'Electronics', employee_id: 'HOD-ECE-001', added_by: 'p1' },
    { id: 'f1', name: 'Prof. Sunita Reddy', email: 'faculty1@college.edu', password: 'fac123', role: 'faculty', department: 'Computer Science', employee_id: 'FAC-CS-001', designation: 'Assistant Professor', added_by: 'h1' },
    { id: 'f2', name: 'Prof. Manoj Gupta', email: 'faculty2@college.edu', password: 'fac123', role: 'faculty', department: 'Computer Science', employee_id: 'FAC-CS-002', designation: 'Associate Professor', added_by: 'h1' },
    { id: 's1', name: 'Rahul Verma', email: 'student1@college.edu', password: 'stu123', role: 'student', department: 'Computer Science', roll_number: 'CS2024001', added_by: 'f1' },
    { id: 's2', name: 'Priya Singh', email: 'student2@college.edu', password: 'stu123', role: 'student', department: 'Computer Science', roll_number: 'CS2024002', added_by: 'f1' },
    { id: 's3', name: 'Amit Desai', email: 'student3@college.edu', password: 'stu123', role: 'student', department: 'Computer Science', roll_number: 'CS2024003', added_by: 'f2' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const ml = u.role === 'student' ? 10 : 12;
    const cl = u.role === 'student' ? 6 : 8;
    const el = u.role === 'student' ? 10 : 15;
    try {
      await conn.query(
        'INSERT INTO users (id, name, email, password, role, department, employee_id, roll_number, designation, added_by, ml_balance, cl_balance, od_balance, el_balance) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [u.id, u.name, u.email, hash, u.role, u.department, u.employee_id||null, u.roll_number||null, u.designation||null, u.added_by||null, ml, cl, 5, el]
      );
    } catch(e) {
      if (e.code !== 'ER_DUP_ENTRY') throw e;
    }
  }

  console.log('✅ Database setup complete with seed data!');
  await conn.end();
}

setup().catch(e => { console.error('❌ Setup failed:', e.message); process.exit(1); });
