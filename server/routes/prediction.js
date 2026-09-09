const express = require('express');
const router = express.Router();
const db = require('../db/database');
const PricePredictionEngine = require('../services/PricePredictionEngine');
const QualityGradingService = require('../services/QualityGradingService');
const WeatherService = require('../services/WeatherService');

// Evaluate Sell Now vs Wait recommendation
router.post('/sell-wait', (req, res) => {
  const {
    cropName = 'Tomato',
    horizonDays = 3,
    currentPrice,
    quantity = 50,
    transportCost = 150
  } = req.body;

  // Retrieve historical prices from database for this crop
  const records = db.collection('market_prices')
    .find({ cropName })
    .slice(-21);

  const historicalPrices = records.map(r => r.processorPrice || r.localMandiPrice);
  const spotPrice = Number(currentPrice) || (records.length > 0 ? records[records.length - 1].processorPrice : 2550);

  // Get weather forecast signal
  const weather = WeatherService.getForecast('Warangal');
  const rainProb = weather.forecast[Math.min(Number(horizonDays), weather.forecast.length - 1)]?.rainProbability || 35;

  const result = PricePredictionEngine.evaluateSellOrWait({
    cropName,
    currentPrice: spotPrice,
    historicalPrices,
    horizonDays: Number(horizonDays),
    weatherSignal: {
      rainProbability: rainProb,
      forecastSummary: weather.current.condition
    },
    transportCost: Number(transportCost),
    quantity: Number(quantity)
  });

  res.json(result);
});

// AI Crop Quality Assessment
router.post('/grade', (req, res) => {
  const { cropName = 'Tomato', imageUri, manualDefectPercent, freshnessScore } = req.body;

  const grading = QualityGradingService.assessQuality({
    cropName,
    imageUri,
    manualOverride: {
      defectPercent: manualDefectPercent !== undefined ? Number(manualDefectPercent) : undefined,
      freshnessScore: freshnessScore !== undefined ? Number(freshnessScore) : undefined
    }
  });

  res.json(grading);
});

module.exports = router;
