const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 1-Click Quick Demo Login for SIH Judges
router.post('/demo-login', (req, res) => {
  const { role = 'farmer' } = req.body;

  let email = 'ramesh@agrisethu.in';
  if (role === 'buyer') email = 'kiran@freshfoods.in';
  else if (role === 'admin') email = 'admin@agrisethu.in';

  const user = db.collection('users').findOne({ email });
  if (!user) {
    return res.status(404).json({ error: `Demo user for role ${role} not found` });
  }

  const token = generateToken(user);
  let profile = null;

  if (user.role === 'farmer') {
    profile = db.collection('farmer_profiles').findOne({ userId: user.id });
  } else if (user.role === 'buyer') {
    profile = db.collection('buyer_profiles').findOne({ userId: user.id });
  }

  res.json({
    message: `Logged in successfully as Demo ${user.role.toUpperCase()}`,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      preferredLanguage: user.preferredLanguage || 'en',
      avatar: user.avatar
    },
    profile
  });
});

// Standard Login
router.post('/login', (req, res) => {
  const { identifier, password, role } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please provide mobile/email and password' });
  }

  const user = db.collection('users').findOne(u => {
    const matchIdentifier = u.email === identifier || u.mobile === identifier;
    const matchRole = role ? u.role === role : true;
    return matchIdentifier && matchRole;
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or account type mismatch' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = generateToken(user);
  let profile = null;

  if (user.role === 'farmer') {
    profile = db.collection('farmer_profiles').findOne({ userId: user.id });
  } else if (user.role === 'buyer') {
    profile = db.collection('buyer_profiles').findOne({ userId: user.id });
  }

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      role: user.role,
      preferredLanguage: user.preferredLanguage || 'en',
      avatar: user.avatar
    },
    profile
  });
});

// Register
router.post('/register', (req, res) => {
  const {
    role,
    name,
    mobile,
    email,
    password,
    preferredLanguage = 'en',
    // Farmer fields
    village,
    district,
    state = 'Telangana',
    farmSizeAcres,
    cropsGrown,
    // Buyer fields
    businessName,
    businessType,
    location,
    requiredCrops,
    targetMonthlyProcurementQuintals
  } = req.body;

  if (!name || !mobile || !password || !role) {
    return res.status(400).json({ error: 'Name, mobile, password, and account type are required' });
  }

  const existing = db.collection('users').findOne(u => u.mobile === mobile || (email && u.email === email));
  if (existing) {
    return res.status(409).json({ error: 'An account with this mobile number or email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = db.collection('users').insert({
    name,
    mobile,
    email: email || `${mobile}@agrisethu.in`,
    passwordHash,
    role,
    preferredLanguage
  });

  let newProfile = null;
  if (role === 'farmer') {
    newProfile = db.collection('farmer_profiles').insert({
      userId: newUser.id,
      village: village || 'Local Village',
      district: district || 'Warangal',
      state,
      farmSizeAcres: Number(farmSizeAcres) || 5,
      cropsGrown: Array.isArray(cropsGrown) ? cropsGrown : (cropsGrown ? cropsGrown.split(',').map(s => s.trim()) : ['Tomato']),
      storageCapacityQuintals: 50,
      hasColdStorageAccess: false
    });
  } else if (role === 'buyer') {
    newProfile = db.collection('buyer_profiles').insert({
      userId: newUser.id,
      businessName: businessName || name,
      businessType: businessType || 'Wholesale Buyer',
      location: location || 'Hyderabad',
      state,
      trustScore: 85,
      isVerified: true,
      totalDealsCompleted: 0,
      requiredCrops: Array.isArray(requiredCrops) ? requiredCrops : (requiredCrops ? requiredCrops.split(',').map(s => s.trim()) : ['Tomato']),
      targetMonthlyProcurementQuintals: Number(targetMonthlyProcurementQuintals) || 100,
      defaultTransportPolicy: 'SHARED_50_50'
    });
  }

  const token = generateToken(newUser);

  res.status(201).json({
    message: 'Registration successful',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      role: newUser.role,
      preferredLanguage: newUser.preferredLanguage
    },
    profile: newProfile
  });
});

// Current User Profile
router.get('/me', authenticate, (req, res) => {
  let profile = null;
  if (req.user.role === 'farmer') {
    profile = db.collection('farmer_profiles').findOne({ userId: req.user.id });
  } else if (req.user.role === 'buyer') {
    profile = db.collection('buyer_profiles').findOne({ userId: req.user.id });
  }

  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      mobile: req.user.mobile,
      role: req.user.role,
      preferredLanguage: req.user.preferredLanguage,
      avatar: req.user.avatar
    },
    profile
  });
});

module.exports = router;
