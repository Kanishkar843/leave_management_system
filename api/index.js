const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/auth', require('../backend/src/routes/auth'));
app.use('/api/users', require('../backend/src/routes/users'));
app.use('/api/leaves', require('../backend/src/routes/leaves'));
app.use('/api/audit', require('../backend/src/routes/audit'));
app.use('/api/notifications', require('../backend/src/routes/notifications'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Root route
app.get('/', (_, res) => {
  res.json({
    message: 'Leave Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      leaves: '/api/leaves',
      audit: '/api/audit',
      notifications: '/api/notifications'
    }
  });
});

module.exports = app;
