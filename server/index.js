const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString().split('T')[1].slice(0, 8)}] ${req.method} ${req.path}`);
  }
  next();
});

// Import API Routes
const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmer');
const buyerRoutes = require('./routes/buyer');
const marketRoutes = require('./routes/market');
const predictionRoutes = require('./routes/prediction');
const calculatorRoutes = require('./routes/calculator');
const offersRoutes = require('./routes/offers');
const ordersRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');
const weatherRoutes = require('./routes/weather');
const ivrRoutes = require('./routes/ivr');
const adminRoutes = require('./routes/admin');

// Mount API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ivr', ivrRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AgriSethu Backend Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    corePrinciple: 'MAXIMUM NET RETURN'
  });
});

// Serve frontend build if dist exists
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Catch-all for client routing or 404 API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send('AgriSethu API Server is running. Client build will be served once compiled.');
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    service: 'AgriSethu'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌾 AGRI SETHU — “From Farm to Fair Price”`);
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
