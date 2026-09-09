const express = require('express');
const router = express.Router();
const db = require('../db/database');
const BestSellingRouteEngine = require('../services/BestSellingRouteEngine');

// Get market prices and historical trends for a crop
router.get('/prices', (req, res) => {
  const { crop = 'Tomato', days = 30 } = req.query;

  const records = db.collection('market_prices')
    .find({ cropName: crop })
    .slice(-Number(days));

  const latest = records[records.length - 1] || null;
  const previous = records.length > 1 ? records[records.length - 2] : latest;

  const price7d = records.slice(-7);
  const avg7d = price7d.length > 0
    ? Math.round(price7d.reduce((s, r) => s + r.localMandiPrice, 0) / price7d.length)
    : 0;

  const minPrice = records.length > 0 ? Math.min(...records.map(r => r.minPrice)) : 0;
  const maxPrice = records.length > 0 ? Math.max(...records.map(r => r.maxPrice)) : 0;

  res.json({
    cropName: crop,
    latest,
    previous,
    summary: {
      currentLocalPrice: latest?.localMandiPrice || 2400,
      currentCityPrice: latest?.cityMandiPrice || 2650,
      currentProcessorPrice: latest?.processorPrice || 2550,
      avg7d,
      minPrice,
      maxPrice,
      volatility: latest?.volatility || 'MODERATE',
      trendDirection: (latest?.localMandiPrice || 0) >= (previous?.localMandiPrice || 0) ? 'UPWARD' : 'DOWNWARD'
    },
    history: records
  });
});

// Compare market channels and selling routes based on MAXIMUM NET RETURN
router.get('/compare', (req, res) => {
  const {
    crop = 'Tomato',
    quantity = 50,
    qualityGrade = 'A',
    farmerLocation = 'Warangal'
  } = req.query;

  const comparison = BestSellingRouteEngine.evaluateRoutes({
    cropName: crop,
    quantity: Number(quantity),
    farmerLocation,
    qualityGrade
  });

  res.json(comparison);
});

// List all supported crops and available markets
router.get('/meta', (req, res) => {
  const crops = db.collection('crops').find();
  const markets = db.collection('markets').find();
  res.json({ crops, markets });
});

module.exports = router;
