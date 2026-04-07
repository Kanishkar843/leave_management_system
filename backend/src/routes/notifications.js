const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC', [req.params.userId]);
    res.json(rows.map(r => ({
      id: r.id, userId: r.user_id, message: r.message, type: r.type,
      read: !!r.read, timestamp: r.timestamp.toISOString()
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET `read` = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:userId/read-all', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET `read` = TRUE WHERE user_id = ?', [req.params.userId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
