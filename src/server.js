require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const superadminRoutes = require('./routes/superadmin');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

// Test route for health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Auth routes
app.use('/api/v1/auth', authRoutes);

// Super admin routes
app.use('/api/v1/superadmin', superadminRoutes);

// Start server with database
async function startServer() {
  try {

    await initDatabase();
    

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/v1/auth/login`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}


startServer();

module.exports = app;