const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const NegotiationService = require('../services/NegotiationService');

router.use(authenticate);

// Get offers relevant to current user
router.get('/', (req, res) => {
  const userId = req.user.id;
  const offers = db.collection('offers').find(o => o.farmerId === userId || o.buyerId === userId);
  res.json({ offers });
});

// Buyer makes a new offer
router.post('/', (req, res) => {
  const {
    listingId,
    offeredPrice,
    quantity,
    transportResponsibility = 'SHARED_50_50',
    note = ''
  } = req.body;

  const listing = db.collection('crop_listings').findById(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Crop listing not found' });
  }

  const buyerProfile = db.collection('buyer_profiles').findOne({ userId: req.user.id }) || {};
  const offerData = NegotiationService.createOffer({
    listing,
    buyer: {
      id: req.user.id,
      name: req.user.name,
      businessName: buyerProfile.businessName || req.user.name
    },
    offeredPrice: Number(offeredPrice),
    quantity: Number(quantity || listing.quantity),
    transportResponsibility,
    note
  });

  const savedOffer = db.collection('offers').insert(offerData);

  // Notify farmer
  db.collection('notifications').insert({
    userId: listing.farmerId,
    title: `New Offer Received for ${listing.cropName}! 🤝`,
    message: `${buyerProfile.businessName || req.user.name} offered ₹${offeredPrice}/qtl for ${offerData.quantity} quintals.`,
    type: 'OFFER_RECEIVED',
    read: false,
    actionUrl: '/farmer/orders'
  });

  res.status(201).json({
    message: 'Offer submitted to farmer successfully',
    offer: savedOffer
  });
});

// Farmer responds to offer (Accept, Reject, Counter)
router.post('/:id/respond', (req, res) => {
  const { responseType, counterPrice, counterTransport, note } = req.body;

  const offer = db.collection('offers').findById(req.params.id);
  if (!offer) {
    return res.status(404).json({ error: 'Offer not found' });
  }

  if (offer.farmerId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the listing farmer can respond to this offer' });
  }

  const updatedOffer = NegotiationService.respondToOffer({
    offer,
    responseType,
    counterPrice: counterPrice ? Number(counterPrice) : null,
    counterTransport,
    responseNote: note
  });

  db.collection('offers').update(req.params.id, updatedOffer);

  // Notify buyer
  db.collection('notifications').insert({
    userId: offer.buyerId,
    title: `Farmer Responded to Your Offer! 🔔`,
    message: `Farmer ${responseType === 'ACCEPT' ? 'accepted your offer!' : (responseType === 'REJECT' ? 'declined your offer.' : `counter-offered at ₹${counterPrice}/qtl.`)}`,
    type: 'OFFER_RESPONSE',
    read: false,
    actionUrl: '/buyer/orders'
  });

  res.json({
    message: `Offer ${responseType.toLowerCase()}ed successfully`,
    offer: updatedOffer
  });
});

module.exports = router;
