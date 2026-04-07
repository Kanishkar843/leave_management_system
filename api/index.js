const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/auth', require('./auth'));
// TODO: Add other routes as needed

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Root route
app.get('/', (_, res) => {
  res.json({
    message: 'Leave Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth'
    }
  });
});

module.exports = app;
