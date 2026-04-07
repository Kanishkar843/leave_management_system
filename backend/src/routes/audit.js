const express = require('express');
const pool = require('../config/db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(rows.map(r => ({
      id: r.id, actorId: r.actor_id, actorName: r.actor_name, actorRole: r.actor_role,
      action: r.action, targetId: r.target_id, targetName: r.target_name,
      remarks: r.remarks, timestamp: r.timestamp.toISOString()
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
