const express = require('express');
const router = express.Router();
const NetReturnEngine = require('../services/NetReturnEngine');
const TransportCalculator = require('../services/TransportCalculator');

// Calculate Net Return
router.post('/net-return', (req, res) => {
  const {
    sellingPrice = 2500,
    quantity = 50,
    transportCost = 0,
    storageCost = 0,
    platformFeeRate = 0.01,
    transactionCost = 20,
    expectedLoss = 0,
    baseProductionCost = 1200
  } = req.body;

  const result = NetReturnEngine.calculateNetReturn({
    sellingPrice: Number(sellingPrice),
    quantity: Number(quantity),
    transportCost: Number(transportCost),
    storageCost: Number(storageCost),
    platformFeeRate: Number(platformFeeRate),
    transactionCost: Number(transactionCost),
    expectedLoss: Number(expectedLoss),
    baseProductionCost: Number(baseProductionCost)
  });

  res.json(result);
});

// Calculate Transport Responsibility and Split
router.post('/transport-share', (req, res) => {
  const {
    produceValue,
    sellingPrice,
    quantity = 10,
    distanceKm = 35,
    transportTotal,
    responsibility = 'SHARED_50_50',
    customBuyerAmount = null,
    storageCost = 0,
    expectedLoss = 0
  } = req.body;

  const totalProduceValue = produceValue !== undefined
    ? Number(produceValue)
    : (Number(sellingPrice || 2500) * Number(quantity));

  let finalTransportTotal = transportTotal;
  let logisticsEstimate = null;

  if (finalTransportTotal === undefined || finalTransportTotal === null) {
    logisticsEstimate = TransportCalculator.estimateTotalTransport({
      distanceKm: Number(distanceKm),
      quantityQuintals: Number(quantity)
    });
    finalTransportTotal = logisticsEstimate.transportTotal;
  }

  const result = TransportCalculator.calculateShares({
    produceValue: totalProduceValue,
    transportTotal: Number(finalTransportTotal),
    responsibility,
    customBuyerAmount: customBuyerAmount !== null ? Number(customBuyerAmount) : null,
    storageCost: Number(storageCost),
    expectedLoss: Number(expectedLoss)
  });

  res.json({
    ...result,
    logisticsEstimate
  });
});

module.exports = router;
