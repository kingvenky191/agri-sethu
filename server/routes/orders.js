const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate } = require('../middleware/auth');
const TransportCalculator = require('../services/TransportCalculator');
const LogisticsService = require('../services/LogisticsService');
const PaymentService = require('../services/PaymentService');

router.use(authenticate);

// List orders for authenticated user
router.get('/', (req, res) => {
  const userId = req.user.id;
  const orders = db.collection('orders').find(o => o.farmerId === userId || o.buyerId === userId);
  res.json({ orders });
});

// Get single order with tracking timeline
router.get('/:id', (req, res) => {
  const order = db.collection('orders').findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const trackingTimeline = LogisticsService.getTrackingTimeline(order);
  res.json({ order, trackingTimeline });
});

// Create a new order (Buy Now flow)
router.post('/', (req, res) => {
  const {
    listingId,
    quantity,
    agreedPricePerUnit,
    transportResponsibility = 'SHARED_50_50',
    customBuyerAmount = null,
    deliveryAddress
  } = req.body;

  const listing = db.collection('crop_listings').findById(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Produce listing not found' });
  }

  const orderQuantity = Number(quantity || listing.quantity);
  const pricePerUnit = Number(agreedPricePerUnit || listing.sellingPrice);
  const produceValue = Math.round(orderQuantity * pricePerUnit);

  // Calculate logistics
  const logisticsPlan = LogisticsService.planShipment({
    origin: listing.farmerLocation,
    destination: deliveryAddress || 'Buyer Central Processing Depot, Hyderabad',
    quantityQuintals: orderQuantity
  });

  // Calculate transport split & financial totals
  const transportShares = TransportCalculator.calculateShares({
    produceValue,
    transportTotal: logisticsPlan.pricing.totalCost,
    responsibility: transportResponsibility,
    customBuyerAmount: customBuyerAmount !== null ? Number(customBuyerAmount) : null
  });

  const orderId = `ORD-2026-${Math.floor(Math.random() * 9000 + 1000)}`;

  // Create payment session
  const paymentSession = PaymentService.createPaymentSession({
    orderId,
    amount: transportShares.buyerSummary.totalPayable,
    buyerName: req.user.name,
    buyerPhone: req.user.mobile
  });

  const newOrder = db.collection('orders').insert({
    id: orderId,
    listingId: listing.id,
    farmerId: listing.farmerId,
    farmerName: listing.farmerName,
    farmerPhone: listing.farmerPhone,
    buyerId: req.user.id,
    buyerName: req.user.name,
    buyerPhone: req.user.mobile,
    cropName: listing.cropName,
    variety: listing.variety,
    qualityGrade: listing.qualityGrade,
    quantity: orderQuantity,
    unit: listing.unit || 'Quintal',
    agreedPricePerUnit: pricePerUnit,
    produceTotal: produceValue,
    transportTotal: logisticsPlan.pricing.totalCost,
    transportResponsibility,
    buyerTransportShare: transportShares.buyerTransportShare,
    farmerTransportShare: transportShares.farmerTransportShare,
    buyerTotalPayable: transportShares.buyerSummary.totalPayable,
    farmerNetReturn: transportShares.farmerSummary.netReturn,
    status: 'PLACED',
    paymentStatus: 'ESCROW_HELD',
    transactionId: paymentSession.transactionId,
    paymentSession,
    logistics: logisticsPlan,
    deliveryAddress: deliveryAddress || 'Bowenpally Terminal Agro Park, Hyderabad',
    financialSummary: transportShares
  });

  // Notify farmer
  db.collection('notifications').insert({
    userId: listing.farmerId,
    title: `New Confirmed Order: ${orderQuantity} qtl ${listing.cropName}! 🎉`,
    message: `${req.user.name} confirmed Order #${orderId}. Escrow payment secured. Net Return: ₹${transportShares.farmerSummary.netReturn.toLocaleString('en-IN')}.`,
    type: 'ORDER_PLACED',
    read: false,
    actionUrl: `/farmer/orders`
  });

  res.status(201).json({
    message: 'Order created successfully with guaranteed escrow hold',
    order: newOrder,
    trackingTimeline: LogisticsService.getTrackingTimeline(newOrder)
  });
});

// Update order status (State Machine)
router.post('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['PLACED', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${allowed.join(', ')}` });
  }

  const order = db.collection('orders').findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const updates = { status };
  if (status === 'CONFIRMED') updates.confirmedAt = new Date().toISOString();
  if (status === 'PREPARING') updates.preparingAt = new Date().toISOString();
  if (status === 'IN_TRANSIT') updates.dispatchedAt = new Date().toISOString();
  if (status === 'DELIVERED') updates.deliveredAt = new Date().toISOString();
  if (status === 'COMPLETED') {
    updates.completedAt = new Date().toISOString();
    updates.paymentStatus = 'SETTLED_TO_FARMER';
  }

  const updatedOrder = db.collection('orders').update(req.params.id, updates);

  // Trigger cross-party notification
  const recipientId = req.user.id === order.buyerId ? order.farmerId : order.buyerId;
  db.collection('notifications').insert({
    userId: recipientId,
    title: `Order Status Update: #${order.id} 📦`,
    message: `Order status transitioned to "${status.replace('_', ' ')}".`,
    type: 'ORDER_STATUS',
    read: false,
    actionUrl: req.user.id === order.buyerId ? '/farmer/orders' : '/buyer/orders'
  });

  res.json({
    message: `Order status changed to ${status}`,
    order: updatedOrder,
    trackingTimeline: LogisticsService.getTrackingTimeline(updatedOrder)
  });
});

// Simulate Sandbox Payment Capture
router.post('/:id/pay', (req, res) => {
  const { paymentMethod = 'UPI_QR' } = req.body;

  const order = db.collection('orders').findById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const captureResult = PaymentService.verifyAndCapturePayment({
    transactionId: order.transactionId,
    paymentMethod
  });

  const updatedOrder = db.collection('orders').update(req.params.id, {
    paymentStatus: 'ESCROW_HELD',
    paymentDetails: captureResult
  });

  res.json({
    message: 'Demo payment captured successfully into escrow',
    receipt: captureResult,
    order: updatedOrder
  });
});

module.exports = router;
