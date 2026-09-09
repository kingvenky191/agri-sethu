const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');
const BuyerMatchingEngine = require('../services/BuyerMatchingEngine');
const TransportCalculator = require('../services/TransportCalculator');

router.use(authenticate);
router.use(requireRole(['buyer', 'admin']));

// Buyer Dashboard Summary
router.get('/dashboard', (req, res) => {
  const buyerId = req.user.id;
  const profile = db.collection('buyer_profiles').findOne({ userId: buyerId }) || {};

  const allListings = db.collection('crop_listings').find({ status: 'ACTIVE' });
  const orders = db.collection('orders').find({ buyerId });
  const activeOrders = orders.filter(o => ['PLACED', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT'].includes(o.status));

  // Compute spend
  const totalSpend = orders.reduce((sum, o) => sum + (Number(o.buyerTotalPayable) || 0), 0);
  const totalVolumeProcured = orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

  // Recommendations for buyer
  const requiredCrops = profile.requiredCrops || ['Tomato', 'Chilli'];
  const recommendedListings = allListings.filter(l => requiredCrops.includes(l.cropName));

  res.json({
    buyer: {
      name: req.user.name,
      businessName: profile.businessName || req.user.name,
      businessType: profile.businessType || 'Direct Commercial Buyer',
      trustScore: profile.trustScore || 92,
      isVerified: profile.isVerified !== false,
      location: profile.location || 'Hyderabad'
    },
    kpis: {
      activeOrdersCount: activeOrders.length,
      totalOrdersCompleted: orders.filter(o => o.status === 'COMPLETED').length,
      totalSpend,
      totalVolumeProcuredQuintals: totalVolumeProcured,
      availableProduceCount: allListings.length,
      trustScore: profile.trustScore || 94
    },
    activeOrders,
    recommendedListings: recommendedListings.slice(0, 6)
  });
});

// Search and filter produce listings
router.get('/search', (req, res) => {
  const {
    crop,
    grade,
    maxDistance = 150,
    minPrice,
    maxPrice,
    minQuantity,
    sortBy = 'recommended'
  } = req.query;

  let listings = db.collection('crop_listings').find({ status: 'ACTIVE' });

  // Filters
  if (crop && crop !== 'All') {
    listings = listings.filter(l => l.cropName.toLowerCase() === crop.toLowerCase());
  }

  if (grade && grade !== 'All') {
    listings = listings.filter(l => l.qualityGrade === grade);
  }

  if (minPrice) {
    listings = listings.filter(l => Number(l.sellingPrice) >= Number(minPrice));
  }

  if (maxPrice) {
    listings = listings.filter(l => Number(l.sellingPrice) <= Number(maxPrice));
  }

  if (minQuantity) {
    listings = listings.filter(l => Number(l.quantity) >= Number(minQuantity));
  }

  // Attach distance and logistics estimate for each listing
  const enriched = listings.map(l => {
    const distanceKm = Math.floor(Math.random() * 35) + 15; // Realistic 15-50km nearby
    const logistics = TransportCalculator.estimateTotalTransport({
      distanceKm,
      quantityQuintals: l.quantity
    });

    const transportShares = TransportCalculator.calculateShares({
      produceValue: l.sellingPrice * l.quantity,
      transportTotal: logistics.transportTotal,
      responsibility: 'SHARED_50_50'
    });

    return {
      ...l,
      distanceKm,
      estimatedTransportTotal: logistics.transportTotal,
      estimatedDeliveryHours: Math.max(1, Math.round((distanceKm / 35) * 10) / 10),
      buyerTotalEstimated: transportShares.buyerSummary.totalPayable,
      farmerNetReturnEstimated: transportShares.farmerSummary.netReturn,
      farmerTrustScore: 95,
      isVerifiedFarmer: true
    };
  });

  // Filter distance
  let filtered = enriched.filter(l => l.distanceKm <= Number(maxDistance));

  // Sorting
  if (sortBy === 'lowest_price') {
    filtered.sort((a, b) => a.sellingPrice - b.sellingPrice);
  } else if (sortBy === 'highest_quality') {
    const rank = { A: 3, B: 2, C: 1 };
    filtered.sort((a, b) => (rank[b.qualityGrade] || 0) - (rank[a.qualityGrade] || 0));
  } else if (sortBy === 'nearest') {
    filtered.sort((a, b) => a.distanceKm - b.distanceKm);
  } else {
    // 'recommended' - balance quality and proximity
    filtered.sort((a, b) => (a.sellingPrice * 0.4 + a.distanceKm * 10) - (b.sellingPrice * 0.4 + b.distanceKm * 10));
  }

  res.json({
    totalCount: filtered.length,
    listings: filtered
  });
});

// Algorithmic buyer matches
router.get('/matches', (req, res) => {
  const buyerId = req.user.id;
  const profile = db.collection('buyer_profiles').findOne({ userId: buyerId }) || {};
  const allListings = db.collection('crop_listings').find({ status: 'ACTIVE' });

  const buyerSim = {
    id: buyerId,
    businessName: profile.businessName || req.user.name,
    businessType: profile.businessType || 'Processor',
    location: profile.location || 'Hyderabad',
    requiredCrops: profile.requiredCrops || ['Tomato', 'Chilli', 'Onion'],
    targetQuantity: 40,
    preferredGrade: 'A',
    trustScore: profile.trustScore || 94,
    transportPolicy: 'SHARED_50_50'
  };

  const matches = allListings
    .map(listing => {
      const matchResult = BuyerMatchingEngine.matchListingWithBuyers(listing, [buyerSim])[0];
      if (!matchResult) return null;

      return {
        listing,
        matchScore: matchResult.matchScore,
        reasons: matchResult.reasons,
        estimatedNetReturn: matchResult.estimatedNetReturn,
        offeredPrice: matchResult.offeredPricePerQtl
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);

  res.json({ matches });
});

// Buyer Orders
router.get('/orders', (req, res) => {
  const orders = db.collection('orders').find({ buyerId: req.user.id });
  res.json({ orders });
});

module.exports = router;
