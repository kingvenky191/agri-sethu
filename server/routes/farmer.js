const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const NetReturnEngine = require('../services/NetReturnEngine');
const PricePredictionEngine = require('../services/PricePredictionEngine');
const BestSellingRouteEngine = require('../services/BestSellingRouteEngine');
const BuyerMatchingEngine = require('../services/BuyerMatchingEngine');
const QualityGradingService = require('../services/QualityGradingService');
const WeatherService = require('../services/WeatherService');

// All farmer routes require role 'farmer' (or admin)
router.use(authenticate);
router.use(requireRole(['farmer', 'admin']));

// Farmer Dashboard Summary
router.get('/dashboard', (req, res) => {
  const farmerId = req.user.id;
  const profile = db.collection('farmer_profiles').findOne({ userId: farmerId }) || {};

  // Get active listings
  const listings = db.collection('crop_listings').find({ farmerId, status: 'ACTIVE' });
  
  // Get primary crop
  const primaryCrop = listings[0]?.cropName || profile.cropsGrown?.[0] || 'Tomato';

  // Get recent price trends for primary crop
  const prices = db.collection('market_prices')
    .find({ cropName: primaryCrop })
    .slice(-14);

  const currentPriceRecord = prices[prices.length - 1] || { localMandiPrice: 2400, cityMandiPrice: 2650, processorPrice: 2550 };
  const historicalNumbers = prices.map(p => p.localMandiPrice);

  // Run Sell/Wait recommendation
  const sellWaitAnalysis = PricePredictionEngine.evaluateSellOrWait({
    cropName: primaryCrop,
    currentPrice: currentPriceRecord.processorPrice || 2550,
    historicalPrices: historicalNumbers,
    horizonDays: 3
  });

  // Run Best Selling Route recommendation
  const routeAnalysis = BestSellingRouteEngine.evaluateRoutes({
    cropName: primaryCrop,
    quantity: listings[0]?.quantity || 50,
    farmerLocation: profile.village || 'Warangal'
  });

  // Match buyers
  const allBuyers = db.collection('buyers').find();
  const buyerMatches = listings[0]
    ? BuyerMatchingEngine.matchListingWithBuyers(listings[0], allBuyers)
    : [];

  // Active orders & notifications
  const orders = db.collection('orders').find(o => o.farmerId === farmerId);
  const pendingOrders = orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT'].includes(o.status));
  const notifications = db.collection('notifications').find({ userId: farmerId }).slice(-5);
  const weather = WeatherService.getForecast(profile.district || 'Warangal');

  // Compute aggregate stats
  const totalListedQuantity = listings.reduce((sum, l) => sum + (Number(l.quantity) || 0), 0);
  const estimatedGrossValue = listings.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.sellingPrice)), 0);

  res.json({
    farmer: {
      name: req.user.name,
      village: profile.village,
      district: profile.district,
      state: profile.state,
      cropsGrown: profile.cropsGrown || ['Tomato']
    },
    kpis: {
      currentMarketPrice: currentPriceRecord.localMandiPrice || 2400,
      bestMarketName: routeAnalysis.bestRoute.name,
      bestMarketSellingPrice: routeAnalysis.bestRoute.sellingPrice,
      expectedNetReturnPerQtl: routeAnalysis.bestRoute.netReturnPerQtl,
      totalActiveListings: listings.length,
      totalListedQuantity,
      estimatedGrossValue,
      pendingOrdersCount: pendingOrders.length,
      sellWaitRecommendation: sellWaitAnalysis.recommendationLabel,
      sellWaitBadgeColor: sellWaitAnalysis.recommendationBadgeColor
    },
    primaryCrop,
    sellWaitAnalysis,
    bestRouteAnalysis: routeAnalysis,
    topBuyerMatch: buyerMatches[0] || null,
    recentListings: listings,
    activeOrders: pendingOrders,
    notifications,
    weather
  });
});

// Get farmer listings
router.get('/listings', (req, res) => {
  const farmerId = req.user.id;
  const listings = db.collection('crop_listings').find({ farmerId });
  res.json({ listings });
});

// Add new produce listing
router.post('/listings', (req, res) => {
  const farmerId = req.user.id;
  const profile = db.collection('farmer_profiles').findOne({ userId: farmerId }) || {};

  const {
    cropName = 'Tomato',
    variety = 'Standard',
    quantity = 10,
    unit = 'Quintal',
    harvestDate,
    expectedSellingDate,
    minimumAcceptablePrice = 2000,
    sellingPrice = 2500,
    preferredSellingRadiusKm = 60,
    hasStorage = false,
    storageCapacityQuintals = 0,
    imageUrl,
    manualDefectPercent
  } = req.body;

  // 1. Run AI Crop Quality Assessment
  const qualityAssessment = QualityGradingService.assessQuality({
    cropName,
    imageUri: imageUrl,
    manualOverride: manualDefectPercent !== undefined ? { defectPercent: Number(manualDefectPercent) } : {}
  });

  const qualityGrade = qualityAssessment.aiAssessment.grade;

  // 2. Insert listing into database
  const newListing = db.collection('crop_listings').insert({
    farmerId,
    farmerName: req.user.name,
    farmerPhone: req.user.mobile,
    farmerLocation: `${profile.village || 'Village'}, ${profile.district || 'District'}`,
    cropName,
    variety,
    quantity: Number(quantity),
    unit,
    qualityGrade,
    sellingPrice: Number(sellingPrice),
    minimumAcceptablePrice: Number(minimumAcceptablePrice),
    harvestDate: harvestDate || new Date().toISOString().split('T')[0],
    expectedSellingDate: expectedSellingDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    preferredSellingRadiusKm: Number(preferredSellingRadiusKm),
    hasStorage: Boolean(hasStorage),
    storageCapacityQuintals: Number(storageCapacityQuintals),
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    aiQualityAssessment: qualityAssessment.aiAssessment
  });

  // 3. Run instantaneous Net Return & Route Analysis
  const routeAnalysis = BestSellingRouteEngine.evaluateRoutes({
    cropName,
    quantity: Number(quantity),
    farmerLocation: profile.village || 'Warangal',
    qualityGrade
  });

  // 4. Match with registered buyers
  const allBuyers = db.collection('buyers').find();
  const matchedBuyers = BuyerMatchingEngine.matchListingWithBuyers(newListing, allBuyers);

  // 5. Notify farmer in-app
  db.collection('notifications').insert({
    userId: farmerId,
    title: `Produce Listed: ${quantity} qtl of ${cropName} (${qualityGrade}) 🍅`,
    message: `AI Quality Grade ${qualityGrade} certified. Found ${matchedBuyers.length} matching buyers nearby!`,
    type: 'PRODUCE_LISTED',
    read: false,
    actionUrl: `/farmer/listings`
  });

  res.status(201).json({
    message: 'Produce listed and analyzed successfully',
    listing: newListing,
    qualityAssessment,
    bestRoute: routeAnalysis.bestRoute,
    matchedBuyersCount: matchedBuyers.length,
    topBuyer: matchedBuyers[0] || null
  });
});

// Update listing
router.put('/listings/:id', (req, res) => {
  const listing = db.collection('crop_listings').findById(req.params.id);
  if (!listing || listing.farmerId !== req.user.id) {
    return res.status(404).json({ error: 'Listing not found or access denied' });
  }

  const updated = db.collection('crop_listings').update(req.params.id, req.body);
  res.json({ message: 'Listing updated successfully', listing: updated });
});

// Delete listing
router.delete('/listings/:id', (req, res) => {
  const listing = db.collection('crop_listings').findById(req.params.id);
  if (!listing || listing.farmerId !== req.user.id) {
    return res.status(404).json({ error: 'Listing not found or access denied' });
  }

  db.collection('crop_listings').delete(req.params.id);
  res.json({ message: 'Listing removed successfully' });
});

// Farmer Orders
router.get('/orders', (req, res) => {
  const orders = db.collection('orders').find({ farmerId: req.user.id });
  res.json({ orders });
});

// Farmer Price Alerts
router.get('/price-alerts', (req, res) => {
  const alerts = db.collection('price_alerts').find({ farmerId: req.user.id });
  res.json({ alerts });
});

router.post('/price-alerts', (req, res) => {
  const { cropName, targetPrice } = req.body;
  const alert = db.collection('price_alerts').insert({
    farmerId: req.user.id,
    cropName: cropName || 'Tomato',
    targetPrice: Number(targetPrice) || 2600,
    active: true
  });
  res.status(201).json({ message: 'Price alert created', alert });
});

module.exports = router;
