const bcrypt = require('bcryptjs');
const db = require('./database');

async function seed() {
  console.log('[SEED] Seeding realistic Indian agricultural demo data...');

  // 1. Password hashes
  const salt = bcrypt.genSaltSync(10);
  const farmerPasswordHash = bcrypt.hashSync('farmer123', salt);
  const buyerPasswordHash = bcrypt.hashSync('buyer123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  // Clear existing collections
  const collections = [
    'users', 'farmer_profiles', 'buyer_profiles', 'crops',
    'crop_listings', 'crop_quality_records', 'markets',
    'market_prices', 'buyers', 'buyer_requirements',
    'offers', 'orders', 'logistics', 'price_alerts', 'notifications'
  ];
  collections.forEach(colName => {
    db.data[colName] = [];
  });

  // 2. Users & Profiles
  const farmerUser = db.collection('users').insert({
    id: 'user-farmer-1',
    name: 'Ramesh Patel',
    email: 'ramesh@agrisethu.in',
    mobile: '9848012345',
    passwordHash: farmerPasswordHash,
    role: 'farmer',
    preferredLanguage: 'en',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
  });

  db.collection('farmer_profiles').insert({
    id: 'profile-farmer-1',
    userId: farmerUser.id,
    village: 'Kothur',
    mandal: 'Geesugonda',
    district: 'Warangal',
    state: 'Telangana',
    pincode: '506330',
    farmSizeAcres: 15,
    cropsGrown: ['Tomato', 'Chilli', 'Cotton'],
    storageCapacityQuintals: 150,
    hasColdStorageAccess: false,
    bankDetails: {
      accountHolder: 'Ramesh Patel',
      accountNumber: '30492817492',
      ifsc: 'SBIN0002148',
      bankName: 'State Bank of India - Warangal Rural'
    }
  });

  const buyerUser = db.collection('users').insert({
    id: 'user-buyer-1',
    name: 'Kiran Reddy',
    email: 'kiran@freshfoods.in',
    mobile: '9849056789',
    passwordHash: buyerPasswordHash,
    role: 'buyer',
    preferredLanguage: 'en',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  });

  db.collection('buyer_profiles').insert({
    id: 'profile-buyer-1',
    userId: buyerUser.id,
    businessName: 'Fresh Foods Processing & Exports Ltd',
    businessType: 'Food Processor & Supermarket Aggregator',
    location: 'Hyderabad Bowenpally Agro Park',
    state: 'Telangana',
    gstin: '36AABCF1234F1ZP',
    trustScore: 94,
    isVerified: true,
    totalDealsCompleted: 88,
    disputeRatePercent: 0.8,
    preferredPaymentMethod: 'ESCROW_BANK_TRANSFER',
    requiredCrops: ['Tomato', 'Chilli', 'Onion', 'Potato'],
    targetMonthlyProcurementQuintals: 500,
    defaultTransportPolicy: 'SHARED_50_50'
  });

  const adminUser = db.collection('users').insert({
    id: 'user-admin-1',
    name: 'AgriSethu National Operations Admin',
    email: 'admin@agrisethu.in',
    mobile: '9900011223',
    passwordHash: adminPasswordHash,
    role: 'admin',
    preferredLanguage: 'en'
  });

  // Additional demo buyers
  const buyer2 = db.collection('buyers').insert({
    id: 'buyer-2',
    name: 'Srinivasa Mega Retail Depot',
    businessName: 'Srinivasa Mega Mart & Retailers',
    businessType: 'Direct Commercial Retailer',
    location: 'Secunderabad Wholesale Mart',
    distanceKm: 42,
    targetPrice: 2550,
    targetQuantity: 40,
    preferredGrade: 'A',
    trustScore: 91,
    isVerified: true,
    transportPolicy: 'BUYER_PAYS',
    requiredCrops: ['Tomato', 'Onion', 'Chilli']
  });

  const buyer3 = db.collection('buyers').insert({
    id: 'buyer-3',
    name: 'Deccan Ketchup & Puree Agro',
    businessName: 'Deccan Agro Processors Pvt Ltd',
    businessType: 'Food Processor',
    location: 'Medchal Industrial Agro Complex',
    distanceKm: 34,
    targetPrice: 2500,
    targetQuantity: 120,
    preferredGrade: 'B',
    trustScore: 96,
    isVerified: true,
    transportPolicy: 'BUYER_PAYS',
    requiredCrops: ['Tomato']
  });

  const buyer4 = db.collection('buyers').insert({
    id: 'buyer-4',
    name: 'Telangana Organic Harvest Hub',
    businessName: 'Rythu Seva Co-op Network',
    businessType: 'Farmer Producer Co-op (FPO)',
    location: 'Warangal Sub-Depot',
    distanceKm: 18,
    targetPrice: 2420,
    targetQuantity: 60,
    preferredGrade: 'A',
    trustScore: 95,
    isVerified: true,
    transportPolicy: 'SHARED_50_50',
    requiredCrops: ['Tomato', 'Cotton', 'Chilli', 'Rice']
  });

  // 3. Crops Metadata
  const cropList = [
    { id: 'crop-1', name: 'Tomato', varieties: ['Desi', 'Hybrid (Sivam)', 'Avinash-2'], unit: 'Quintal', category: 'Vegetable', shelfLifeDays: 7, baseCostPerQtl: 1100 },
    { id: 'crop-2', name: 'Cotton', varieties: ['Bt Cotton (RCH-2)', 'Long Staple Surabhi'], unit: 'Quintal', category: 'Cash Crop', shelfLifeDays: 90, baseCostPerQtl: 4800 },
    { id: 'crop-3', name: 'Chilli', varieties: ['Teja', 'Guntur Sannam', 'Wonder Hot'], unit: 'Quintal', category: 'Spices', shelfLifeDays: 45, baseCostPerQtl: 11000 },
    { id: 'crop-4', name: 'Rice', varieties: ['Sona Masoori', 'Basmati 1121', 'BPT 5204'], unit: 'Quintal', category: 'Grain', shelfLifeDays: 120, baseCostPerQtl: 1900 },
    { id: 'crop-5', name: 'Maize', varieties: ['DNH-105', 'Sweet Corn Hybrid'], unit: 'Quintal', category: 'Cereal', shelfLifeDays: 60, baseCostPerQtl: 1400 },
    { id: 'crop-6', name: 'Onion', varieties: ['Nashik Red', 'Garlic White'], unit: 'Quintal', category: 'Vegetable', shelfLifeDays: 25, baseCostPerQtl: 1300 },
    { id: 'crop-7', name: 'Potato', varieties: ['Kufri Jyoti', 'Chipsona-1'], unit: 'Quintal', category: 'Vegetable', shelfLifeDays: 35, baseCostPerQtl: 950 }
  ];
  db.collection('crops').insertMany(cropList);

  // 4. Mandis & Markets
  const markets = [
    { id: 'mkt-1', name: 'Warangal Local APMC Mandi', type: 'Local Mandi', location: 'Warangal', distanceKm: 12, feePercent: 2.0 },
    { id: 'mkt-2', name: 'Hyderabad Bowenpally Wholesale Terminal', type: 'City Mandi', location: 'Hyderabad', distanceKm: 145, feePercent: 2.5 },
    { id: 'mkt-3', name: 'Kisan Agro Processing Hub', type: 'Processor', location: 'Ghanpur', distanceKm: 32, feePercent: 0.5 },
    { id: 'mkt-4', name: 'Deccan Mega Retail Depot', type: 'Direct Retailer', location: 'Secunderabad', distanceKm: 65, feePercent: 1.0 },
    { id: 'mkt-5', name: 'Telangana Rythu Mithra FPO', type: 'FPO', location: 'Atmakur', distanceKm: 18, feePercent: 0.5 }
  ];
  db.collection('markets').insertMany(markets);

  // 5. Generate 30 days of realistic daily market price history
  const today = new Date();
  const basePrices = {
    Tomato: { local: 2150, city: 2420, processor: 2350 },
    Chilli: { local: 17800, city: 18900, processor: 18400 },
    Cotton: { local: 6950, city: 7350, processor: 7150 },
    Rice: { local: 3200, city: 3500, processor: 3380 },
    Maize: { local: 2050, city: 2220, processor: 2180 },
    Onion: { local: 2350, city: 2650, processor: 2500 },
    Potato: { local: 1650, city: 1880, processor: 1780 }
  };

  const priceEntries = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Simulate realistic market fluctuations with gentle upward 7-day trend for Tomato
    const progress = (30 - i) / 30; // 0 to 1
    const trendFactor = progress * 0.12; // +12% over month
    const dailyNoise = (Math.sin(i * 1.5) * 0.03) + (Math.cos(i * 0.8) * 0.02);

    Object.entries(basePrices).forEach(([crop, channels]) => {
      const multiplier = 1 + trendFactor + dailyNoise;
      const localPrice = Math.round(channels.local * multiplier);
      const cityPrice = Math.round(channels.city * multiplier);
      const processorPrice = Math.round(channels.processor * multiplier);

      priceEntries.push({
        date: dateStr,
        cropName: crop,
        localMandiPrice: localPrice,
        cityMandiPrice: cityPrice,
        processorPrice: processorPrice,
        minPrice: Math.round(localPrice * 0.95),
        maxPrice: Math.round(cityPrice * 1.04),
        arrivalVolumeQuintals: Math.round(450 + (Math.sin(i) * 120)),
        volatility: 'MODERATE'
      });
    });
  }
  db.collection('market_prices').insertMany(priceEntries);

  // 6. Active Crop Listings for Ramesh Patel
  const listing1 = db.collection('crop_listings').insert({
    id: 'listing-tomato-1',
    farmerId: farmerUser.id,
    farmerName: 'Ramesh Patel',
    farmerPhone: '9848012345',
    farmerLocation: 'Kothur, Warangal, Telangana',
    cropName: 'Tomato',
    variety: 'Hybrid (Sivam)',
    quantity: 50,
    unit: 'Quintal',
    qualityGrade: 'A',
    sellingPrice: 2600, // per quintal
    harvestDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    expectedSellingDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    minimumAcceptablePrice: 2350,
    preferredSellingRadiusKm: 60,
    hasStorage: true,
    storageCapacityQuintals: 60,
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    aiQualityAssessment: {
      grade: 'A',
      confidence: 94,
      defectPercent: 2.1,
      freshnessIndex: 96,
      colorUniformity: 'Deep Crimson Red (Uniform)',
      assessedAt: new Date().toISOString()
    }
  });

  const listing2 = db.collection('crop_listings').insert({
    id: 'listing-chilli-1',
    farmerId: farmerUser.id,
    farmerName: 'Ramesh Patel',
    farmerPhone: '9848012345',
    farmerLocation: 'Kothur, Warangal, Telangana',
    cropName: 'Chilli',
    variety: 'Teja Superior',
    quantity: 25,
    unit: 'Quintal',
    qualityGrade: 'A',
    sellingPrice: 19200,
    harvestDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    expectedSellingDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    minimumAcceptablePrice: 18000,
    preferredSellingRadiusKm: 100,
    hasStorage: true,
    storageCapacityQuintals: 50,
    imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    aiQualityAssessment: {
      grade: 'A',
      confidence: 96,
      defectPercent: 1.8,
      freshnessIndex: 97,
      colorUniformity: 'Vibrant Scarlet Red',
      assessedAt: new Date().toISOString()
    }
  });

  const listing3 = db.collection('crop_listings').insert({
    id: 'listing-cotton-1',
    farmerId: farmerUser.id,
    farmerName: 'Ramesh Patel',
    farmerPhone: '9848012345',
    farmerLocation: 'Kothur, Warangal, Telangana',
    cropName: 'Cotton',
    variety: 'Bt Cotton Long Staple',
    quantity: 40,
    unit: 'Quintal',
    qualityGrade: 'B',
    sellingPrice: 7300,
    harvestDate: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
    expectedSellingDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    minimumAcceptablePrice: 7000,
    preferredSellingRadiusKm: 80,
    hasStorage: true,
    storageCapacityQuintals: 100,
    imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    aiQualityAssessment: {
      grade: 'B',
      confidence: 91,
      defectPercent: 4.2,
      freshnessIndex: 90,
      colorUniformity: 'Natural White Ivory',
      assessedAt: new Date().toISOString()
    }
  });

  // 7. Active Sample Orders
  const order1 = db.collection('orders').insert({
    id: 'ORD-2026-8812',
    listingId: listing1.id,
    farmerId: farmerUser.id,
    farmerName: 'Ramesh Patel',
    farmerPhone: '9848012345',
    buyerId: buyerUser.id,
    buyerName: 'Fresh Foods Processing & Exports Ltd',
    buyerPhone: '9849056789',
    cropName: 'Tomato',
    quantity: 30,
    unit: 'Quintal',
    agreedPricePerUnit: 2550,
    produceTotal: 76500,
    transportTotal: 960,
    transportResponsibility: 'SHARED_50_50',
    buyerTransportShare: 480,
    farmerTransportShare: 480,
    buyerTotalPayable: 77030, // produce + 480 + 50 fee
    farmerNetReturn: 74215, // produce - 480 - 765 (fee) - 20 (tx) - storage/loss
    status: 'IN_TRANSIT',
    paymentStatus: 'ESCROW_HELD',
    transactionId: 'AGRI-TXN-881245-091',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    confirmedAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
    preparingAt: new Date(Date.now() - 86400000 * 0.4).toISOString(),
    dispatchedAt: new Date(Date.now() - 86400000 * 0.1).toISOString(),
    logistics: {
      driverName: 'Srinivas Rao',
      driverPhone: '+91 98480 23114',
      vehicleNumber: 'TS 03 UA 7824',
      vehicleType: 'Pickup (Mahindra Bolero Maxi)',
      distanceKm: 38,
      estimatedDeliveryHours: 1.5,
      currentLocation: 'Warangal-Hyderabad Highway (Near Jangaon)'
    }
  });

  // 8. Pending Offers / Negotiations
  db.collection('offers').insert({
    id: 'offer-1',
    listingId: listing1.id,
    farmerId: farmerUser.id,
    buyerId: buyerUser.id,
    buyerName: 'Fresh Foods Processing & Exports Ltd',
    cropName: 'Tomato',
    quantity: 50,
    originalPrice: 2600,
    offeredPrice: 2550,
    transportResponsibility: 'BUYER_PAYS',
    note: 'Procuring 50 quintals for batch canning. Ready for immediate pickup today with direct bank escrow.',
    status: 'PENDING_FARMER_REVIEW',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeline: [
      {
        action: 'OFFER_MADE',
        actor: 'Kiran Reddy (Fresh Foods)',
        role: 'buyer',
        price: 2550,
        transport: 'BUYER_PAYS',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        note: 'Procuring 50 quintals for batch canning. We pay 100% transport.'
      }
    ]
  });

  // 9. Notifications
  db.collection('notifications').insertMany([
    {
      id: 'notif-1',
      userId: farmerUser.id,
      title: 'New Buyer Offer Received! 🍅',
      message: 'Fresh Foods Processing offered ₹2,550/qtl for 50 quintals of Tomato (Buyer pays 100% transport).',
      type: 'OFFER_RECEIVED',
      read: false,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      actionUrl: '/farmer/orders'
    },
    {
      id: 'notif-2',
      userId: farmerUser.id,
      title: 'Market Intelligence Alert 📈',
      message: 'Tomato spot price reached ₹2,580/qtl in Hyderabad Wholesale Mandi (+₹140 today).',
      type: 'PRICE_ALERT',
      read: false,
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      actionUrl: '/farmer/market-prices'
    },
    {
      id: 'notif-3',
      userId: farmerUser.id,
      title: 'Truck Picked Up - Order #ORD-2026-8812 🚚',
      message: 'Driver Srinivas Rao loaded 30 quintals and is en route to Hyderabad Agro Park.',
      type: 'LOGISTICS_UPDATE',
      read: true,
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      actionUrl: '/farmer/orders'
    },
    {
      id: 'notif-4',
      userId: buyerUser.id,
      title: 'New High Quality Produce Available 🌾',
      message: 'Farmer Ramesh Patel listed 50 quintals of Grade A Tomato near Warangal (38 km from your hub).',
      type: 'NEW_PRODUCE',
      read: false,
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      actionUrl: '/buyer/search'
    }
  ]);

  // 10. Farmer Target Price Alerts
  db.collection('price_alerts').insertMany([
    {
      id: 'alert-1',
      farmerId: farmerUser.id,
      cropName: 'Tomato',
      targetPrice: 2600,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'alert-2',
      farmerId: farmerUser.id,
      cropName: 'Chilli',
      targetPrice: 19500,
      active: true,
      createdAt: new Date().toISOString()
    }
  ]);

  db.save();
  console.log('[SEED] Demo data seeded successfully!');
}

seed();
