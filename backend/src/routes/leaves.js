const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [leaves] = await pool.query('SELECT * FROM leaves ORDER BY applied_at DESC');
    const [chains] = await pool.query('SELECT * FROM approval_chain');
    const result = leaves.map(l => ({
      id: l.id, userId: l.user_id, userName: l.user_name, userRole: l.user_role,
      department: l.department, type: l.type, reason: l.reason,
      fromDate: l.from_date.toISOString().split('T')[0], toDate: l.to_date.toISOString().split('T')[0],
      status: l.status, proofUrl: l.proof_url, rejectionReason: l.rejection_reason,
      appliedAt: l.applied_at.toISOString(),
      approvalChain: chains.filter(c => c.leave_id === l.id).map(c => ({
        role: c.role, action: c.action, actorId: c.actor_id, actorName: c.actor_name,
        remarks: c.remarks, timestamp: c.timestamp?.toISOString()
      }))
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const [leaves] = await pool.query('SELECT * FROM leaves WHERE user_id = ? ORDER BY applied_at DESC', [req.params.userId]);
    const [chains] = await pool.query('SELECT * FROM approval_chain WHERE leave_id IN (?)', [leaves.map(l=>l.id).length ? leaves.map(l=>l.id) : ['']]);
    const result = leaves.map(l => ({
      id: l.id, userId: l.user_id, userName: l.user_name, userRole: l.user_role,
      department: l.department, type: l.type, reason: l.reason,
      fromDate: l.from_date.toISOString().split('T')[0], toDate: l.to_date.toISOString().split('T')[0],
      status: l.status, proofUrl: l.proof_url, rejectionReason: l.rejection_reason,
      appliedAt: l.applied_at.toISOString(),
      approvalChain: chains.filter(c => c.leave_id === l.id).map(c => ({
        role: c.role, action: c.action, actorId: c.actor_id, actorName: c.actor_name,
        remarks: c.remarks, timestamp: c.timestamp?.toISOString()
      }))
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/pending', async (req, res) => {
  try {
    const { role, department } = req.query;
    const roleStatusMap = {
      faculty: ['pending'],
      hod: ['pending', 'approved_by_faculty'],
      principal: ['pending', 'approved_by_faculty', 'approved_by_hod'],
    };
    const statuses = roleStatusMap[role] || [];
    if (!statuses.length) return res.json([]);

    const placeholders = statuses.map(() => '?').join(',');
    let query = `SELECT * FROM leaves WHERE status IN (${placeholders})`;
    const params = [...statuses];

    if (role !== 'principal') {
      query += ' AND department = ?';
      params.push(department);
    }

    const [leaves] = await pool.query(query + ' ORDER BY applied_at DESC', params);
    const leaveIds = leaves.map(l => l.id);
    const [chains] = leaveIds.length
      ? await pool.query('SELECT * FROM approval_chain WHERE leave_id IN (?)', [leaveIds])
      : [[]];

    const result = leaves.filter(l => {
      const step = chains.find(c => c.leave_id === l.id && c.role === role);
      return step && step.action === 'pending';
    }).map(l => ({
      id: l.id, userId: l.user_id, userName: l.user_name, userRole: l.user_role,
      department: l.department, type: l.type, reason: l.reason,
      fromDate: l.from_date.toISOString().split('T')[0], toDate: l.to_date.toISOString().split('T')[0],
      status: l.status, appliedAt: l.applied_at.toISOString(),
      approvalChain: chains.filter(c => c.leave_id === l.id).map(c => ({
        role: c.role, action: c.action, actorId: c.actor_id, actorName: c.actor_name,
        remarks: c.remarks, timestamp: c.timestamp?.toISOString()
      }))
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { userId, userName, userRole, department, type, reason, fromDate, toDate, proofUrl } = req.body;
    const id = uuidv4().substring(0, 8);
    await pool.query(
      'INSERT INTO leaves (id,user_id,user_name,user_role,department,type,reason,from_date,to_date,proof_url) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, userId, userName, userRole, department, type, reason, fromDate, toDate, proofUrl||null]
    );
    const chain = [];
    if (userRole === 'student') chain.push('faculty', 'hod', 'principal');
    else if (userRole === 'faculty') chain.push('hod', 'principal');
    else if (userRole === 'hod') chain.push('principal');
    for (const role of chain) {
      await pool.query('INSERT INTO approval_chain (leave_id, role) VALUES (?,?)', [id, role]);
    }
    res.json({ id, status: 'pending' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const getNextStatus = (current, approverRole) => {
  if (current === 'pending' && approverRole === 'faculty') return 'approved_by_faculty';
  if (['pending','approved_by_faculty'].includes(current) && approverRole === 'hod') return 'approved_by_hod';
  if (['pending','approved_by_faculty','approved_by_hod'].includes(current) && approverRole === 'principal') return 'approved';
  return null;
};

router.put('/:id/approve', async (req, res) => {
  try {
    const { actorId, actorName, actorRole, remarks } = req.body;
    const [leaves] = await pool.query('SELECT * FROM leaves WHERE id = ?', [req.params.id]);
    if (!leaves.length) return res.status(404).json({ error: 'Leave not found' });
    const leave = leaves[0];
    const nextStatus = getNextStatus(leave.status, actorRole);
    if (!nextStatus) return res.status(400).json({ error: 'Cannot approve at this stage' });

    await pool.query('UPDATE leaves SET status = ? WHERE id = ?', [nextStatus, leave.id]);
    await pool.query('UPDATE approval_chain SET action="approved", actor_id=?, actor_name=?, remarks=?, timestamp=NOW() WHERE leave_id=? AND role=?',
      [actorId, actorName, remarks, leave.id, actorRole]);

    if (nextStatus === 'approved') {
      const days = Math.ceil((new Date(leave.to_date) - new Date(leave.from_date)) / 86400000) + 1;
      const col = `${leave.type.toLowerCase()}_balance`;
      await pool.query(`UPDATE users SET ${col} = GREATEST(0, ${col} - ?) WHERE id = ?`, [days, leave.user_id]);
    }

    const nid = uuidv4().substring(0, 8);
    await pool.query('INSERT INTO notifications (id,user_id,message,type) VALUES (?,?,?,?)',
      [nid, leave.user_id, `Your leave has been approved by ${actorName} (${actorRole})`, 'success']);

    const aid = uuidv4().substring(0, 8);
    await pool.query('INSERT INTO audit_logs (id,actor_id,actor_name,actor_role,action,target_id,remarks) VALUES (?,?,?,?,?,?,?)',
      [aid, actorId, actorName, actorRole, 'Approved leave', leave.id, remarks]);

    res.json({ status: nextStatus });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/reject', async (req, res) => {
  try {
    const { actorId, actorName, actorRole, reason } = req.body;
    await pool.query('UPDATE leaves SET status="rejected", rejection_reason=? WHERE id=?', [reason, req.params.id]);
    await pool.query('UPDATE approval_chain SET action="rejected", actor_id=?, actor_name=?, remarks=?, timestamp=NOW() WHERE leave_id=? AND role=?',
      [actorId, actorName, reason, req.params.id, actorRole]);

    const [leaves] = await pool.query('SELECT user_id FROM leaves WHERE id=?', [req.params.id]);
    const nid = uuidv4().substring(0, 8);
    await pool.query('INSERT INTO notifications (id,user_id,message,type) VALUES (?,?,?,?)',
      [nid, leaves[0].user_id, `Your leave was rejected by ${actorName}: ${reason}`, 'error']);

    const aid = uuidv4().substring(0, 8);
    await pool.query('INSERT INTO audit_logs (id,actor_id,actor_name,actor_role,action,target_id,remarks) VALUES (?,?,?,?,?,?,?)',
      [aid, actorId, actorName, actorRole, 'Rejected leave', req.params.id, reason]);

    res.json({ status: 'rejected' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
