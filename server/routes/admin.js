const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

router.use(authenticate);
router.use(requireRole('admin'));

// Admin Overview
router.get('/overview', (req, res) => {
  const users = db.collection('users').find();
  const farmers = users.filter(u => u.role === 'farmer');
  const buyers = users.filter(u => u.role === 'buyer');
  const listings = db.collection('crop_listings').find();
  const orders = db.collection('orders').find();
  const prices = db.collection('market_prices').find();

  const totalTransactionVolume = orders.reduce((sum, o) => sum + (Number(o.buyerTotalPayable) || 0), 0);

  res.json({
    metrics: {
      totalUsers: users.length,
      totalFarmers: farmers.length,
      totalBuyers: buyers.length,
      activeListings: listings.filter(l => l.status === 'ACTIVE').length,
      totalOrders: orders.length,
      totalTransactionVolume,
      totalPriceRecords: prices.length,
      systemHealth: 'OPTIMAL (100% Uptime)',
      predictionModelVersion: 'v2.4.1-edge'
    },
    recentUsers: users.slice(-8).map(u => ({ id: u.id, name: u.name, role: u.role, mobile: u.mobile, email: u.email })),
    recentOrders: orders.slice(-6),
    recentListings: listings.slice(-6)
  });
});

// Update spot mandi price
router.post('/market-prices', (req, res) => {
  const { cropName, localMandiPrice, cityMandiPrice, processorPrice } = req.body;
  const newPrice = db.collection('market_prices').insert({
    date: new Date().toISOString().split('T')[0],
    cropName,
    localMandiPrice: Number(localMandiPrice),
    cityMandiPrice: Number(cityMandiPrice),
    processorPrice: Number(processorPrice),
    minPrice: Math.round(Number(localMandiPrice) * 0.95),
    maxPrice: Math.round(Number(cityMandiPrice) * 1.05),
    arrivalVolumeQuintals: 500,
    volatility: 'MODERATE'
  });

  res.status(201).json({ message: 'Price record added', price: newPrice });
});

module.exports = router;
