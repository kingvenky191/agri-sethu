const express = require('express');
const router = express.Router();
const WeatherService = require('../services/WeatherService');

router.get('/', (req, res) => {
  const { region = 'Warangal' } = req.query;
  const weather = WeatherService.getForecast(region);
  res.json(weather);
});

module.exports = router;
