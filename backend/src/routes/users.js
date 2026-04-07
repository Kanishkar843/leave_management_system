const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, department, employee_id, roll_number, designation, added_by, ml_balance, cl_balance, od_balance, el_balance FROM users');
    const users = rows.map(u => ({
      id: u.id, name: u.name, email: u.email, role: u.role, department: u.department,
      employeeId: u.employee_id, rollNumber: u.roll_number, designation: u.designation, addedBy: u.added_by,
      leaveBalance: { ML: u.ml_balance, CL: u.cl_balance, OD: u.od_balance, EL: u.el_balance }
    }));
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, department, employeeId, rollNumber, designation, addedBy } = req.body;
    const id = uuidv4().substring(0, 8);
    const hash = await bcrypt.hash(password, 10);
    const ml = role === 'student' ? 10 : 12;
    const cl = role === 'student' ? 6 : 8;
    const el = role === 'student' ? 10 : 15;
    await pool.query(
      'INSERT INTO users (id,name,email,password,role,department,employee_id,roll_number,designation,added_by,ml_balance,cl_balance,od_balance,el_balance) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, name, email, hash, role, department, employeeId||null, rollNumber||null, designation||null, addedBy||null, ml, cl, 5, el]
    );
    res.json({ id, name, email, role, department, leaveBalance: { ML: ml, CL: cl, OD: 5, EL: el } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
