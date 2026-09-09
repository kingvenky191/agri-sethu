const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Farmer Analytics
router.get('/farmer', (req, res) => {
  const farmerId = req.user.id;
  const orders = db.collection('orders').find({ farmerId });
  const listings = db.collection('crop_listings').find({ farmerId });

  // Calculate gross sales, net returns, deductions breakdown
  let totalGross = 0;
  let totalNet = 0;
  let totalTransport = 0;
  let totalPlatformFee = 0;
  let totalVolume = 0;

  orders.forEach(o => {
    totalGross += Number(o.produceTotal) || 0;
    totalNet += Number(o.farmerNetReturn) || 0;
    totalTransport += Number(o.farmerTransportShare) || 0;
    totalPlatformFee += Math.round((Number(o.produceTotal) || 0) * 0.01);
    totalVolume += Number(o.quantity) || 0;
  });

  // Mock baseline if farmer has only 1 order
  if (totalGross === 0) {
    totalGross = 145000;
    totalNet = 132400;
    totalTransport = 6800;
    totalPlatformFee = 1450;
    totalVolume = 65;
  }

  // Monthly revenue trend (past 6 months)
  const monthlyData = [
    { month: 'Apr', gross: 24000, net: 22100, volume: 12 },
    { month: 'May', gross: 32000, net: 29400, volume: 15 },
    { month: 'Jun', gross: 28000, net: 25600, volume: 14 },
    { month: 'Jul', gross: 42000, net: 38500, volume: 20 },
    { month: 'Aug', gross: 55000, net: 50800, volume: 26 },
    { month: 'Sep', gross: totalGross, net: totalNet, volume: totalVolume }
  ];

  // Expense deductions breakdown
  const expenseBreakdown = [
    { category: 'Farmer Net Take-Home', amount: totalNet, percentage: Math.round((totalNet / totalGross) * 100) },
    { category: 'Transport (Farmer Share)', amount: totalTransport, percentage: Math.round((totalTransport / totalGross) * 100) || 5 },
    { category: 'Platform & Tech Fee (1%)', amount: totalPlatformFee, percentage: 1 },
    { category: 'Storage & Spoilage Avoided', amount: Math.round(totalGross * 0.03), percentage: 3 }
  ];

  // Channel comparison
  const channelPerformance = [
    { channel: 'Food Processors', avgNetPerQtl: 2490, volume: 45, rating: 'Highest Net Profit' },
    { channel: 'City Wholesale Mandi', avgNetPerQtl: 2350, volume: 30, rating: 'High Transport Cut' },
    { channel: 'Direct Supermarket', avgNetPerQtl: 2460, volume: 25, rating: 'Fast Settlement' },
    { channel: 'Local APMC Mandi', avgNetPerQtl: 2280, volume: 20, rating: 'High Intermediary Cess' }
  ];

  res.json({
    metrics: {
      totalGrossRevenue: totalGross,
      totalNetEarnings: totalNet,
      averageNetReturnPerQtl: Math.round(totalNet / (totalVolume || 1)),
      totalDeductions: totalGross - totalNet,
      retainedMarginPercent: Math.round((totalNet / totalGross) * 100),
      totalVolumeSoldQuintals: totalVolume,
      activeListingsCount: listings.length
    },
    monthlyData,
    expenseBreakdown,
    channelPerformance
  });
});

// Buyer Analytics
router.get('/buyer', (req, res) => {
  const buyerId = req.user.id;
  const orders = db.collection('orders').find({ buyerId });

  let totalSpend = orders.reduce((s, o) => s + (Number(o.buyerTotalPayable) || 0), 0);
  let totalVolume = orders.reduce((s, o) => s + (Number(o.quantity) || 0), 0);

  if (totalSpend === 0) {
    totalSpend = 185000;
    totalVolume = 75;
  }

  const procurementByCrop = [
    { crop: 'Tomato', spend: Math.round(totalSpend * 0.55), volume: 45, qualityA: '92%' },
    { crop: 'Chilli', spend: Math.round(totalSpend * 0.30), volume: 18, qualityA: '95%' },
    { crop: 'Onion', spend: Math.round(totalSpend * 0.15), volume: 12, qualityA: '88%' }
  ];

  const savingsVsTerminalMandi = Math.round(totalSpend * 0.085); // 8.5% savings bypassing middlemen

  res.json({
    metrics: {
      totalSpend,
      totalVolumeProcured: totalVolume,
      savingsVsTerminalMandi,
      averageCostPerQuintal: Math.round(totalSpend / (totalVolume || 1)),
      verifiedFarmerSourcingRate: '100%',
      onTimeDeliveryRate: '96.4%'
    },
    procurementByCrop
  });
});

module.exports = router;
