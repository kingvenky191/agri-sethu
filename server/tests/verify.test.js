const assert = require('assert');
const NetReturnEngine = require('../services/NetReturnEngine');
const TransportCalculator = require('../services/TransportCalculator');
const PricePredictionEngine = require('../services/PricePredictionEngine');
const BestSellingRouteEngine = require('../services/BestSellingRouteEngine');
const QualityGradingService = require('../services/QualityGradingService');
const NegotiationService = require('../services/NegotiationService');

console.log('====================================================');
console.log('🧪 RUNNING AGRI SETHU RIGOROUS VERIFICATION SUITE');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

// TEST 1: AI Quality Grading & Produce Listing assessment
test('TEST 1: AI Quality Assessment returns Grade A with confidence and diagnostics', () => {
  const assessment = QualityGradingService.assessQuality({
    cropName: 'Tomato',
    manualOverride: { defectPercent: 2.0, freshnessScore: 95 }
  });
  assert.strictEqual(assessment.aiAssessment.grade, 'A');
  assert.ok(assessment.aiAssessment.confidence >= 90);
  assert.ok(assessment.aiAssessment.parameters.visibleDefects.includes('2%'));
});

// TEST 2: Market comparison calculates distinct net returns across channels
test('TEST 2: Market comparison ranks by MAXIMUM NET RETURN (not just gross price)', () => {
  const result = BestSellingRouteEngine.evaluateRoutes({
    cropName: 'Tomato',
    quantity: 50,
    qualityGrade: 'A'
  });
  assert.ok(result.routes.length === 5);
  assert.strictEqual(result.routes[0].badge, '🏆 BEST NET RETURN');
  // Verify sorted by netReturn descending
  for (let i = 0; i < result.routes.length - 1; i++) {
    assert.ok(result.routes[i].netReturn >= result.routes[i + 1].netReturn);
  }
});

// TEST 3: Buyer pays transport -> Farmer net return reaches maximum
test('TEST 3: When Buyer pays transport, farmer deductions exclude transport', () => {
  const result = TransportCalculator.calculateShares({
    produceValue: 100000,
    transportTotal: 2000,
    responsibility: 'BUYER_PAYS'
  });
  assert.strictEqual(result.farmerTransportShare, 0);
  assert.strictEqual(result.buyerTransportShare, 2000);
  assert.strictEqual(result.buyerSummary.totalPayable, 100000 + 2000 + 50);
  // Farmer deduction should not include transport
  assert.strictEqual(result.farmerSummary.transportDeduction, 0);
});

// TEST 4: Farmer pays transport -> Farmer net return decreases by full transport amount
test('TEST 4: When Farmer pays transport, farmer deduction includes 100% of transport', () => {
  const buyerPays = TransportCalculator.calculateShares({
    produceValue: 100000,
    transportTotal: 2000,
    responsibility: 'BUYER_PAYS'
  });
  const farmerPays = TransportCalculator.calculateShares({
    produceValue: 100000,
    transportTotal: 2000,
    responsibility: 'FARMER_PAYS'
  });
  assert.strictEqual(farmerPays.farmerTransportShare, 2000);
  assert.strictEqual(farmerPays.buyerTransportShare, 0);
  // Farmer Net Return should drop by exactly 2000
  assert.strictEqual(buyerPays.farmerSummary.netReturn - farmerPays.farmerSummary.netReturn, 2000);
});

// TEST 5: 50/50 Shared transport divides freight equally
test('TEST 5: Shared 50/50 transport divides total cost equally with transparent totals', () => {
  const result = TransportCalculator.calculateShares({
    produceValue: 80000,
    transportTotal: 1500,
    responsibility: 'SHARED_50_50'
  });
  assert.strictEqual(result.buyerTransportShare, 750);
  assert.strictEqual(result.farmerTransportShare, 750);
  assert.strictEqual(result.buyerTransportShare + result.farmerTransportShare, 1500);
});

// TEST 6: Buyer makes an offer
test('TEST 6: NegotiationService handles initial buyer offer correctly', () => {
  const offer = NegotiationService.createOffer({
    listing: { id: 'l1', sellingPrice: 2600, quantity: 40, farmerId: 'f1', cropName: 'Tomato' },
    buyer: { id: 'b1', name: 'Kiran Reddy', businessName: 'Fresh Foods' },
    offeredPrice: 2500,
    transportResponsibility: 'BUYER_PAYS'
  });
  assert.strictEqual(offer.status, 'PENDING_FARMER_REVIEW');
  assert.strictEqual(offer.priceDiff, -100);
  assert.strictEqual(offer.timeline.length, 1);
});

// TEST 7: Farmer accepts offer or counter-offers
test('TEST 7: Farmer accepts offer and locks agreed price', () => {
  const offer = NegotiationService.createOffer({
    listing: { id: 'l1', sellingPrice: 2600, quantity: 40, farmerId: 'f1', cropName: 'Tomato' },
    buyer: { id: 'b1', name: 'Kiran' },
    offeredPrice: 2550,
    transportResponsibility: 'SHARED_50_50'
  });
  const accepted = NegotiationService.respondToOffer({
    offer,
    responseType: 'ACCEPT'
  });
  assert.strictEqual(accepted.status, 'ACCEPTED');
  assert.strictEqual(accepted.finalAgreedPrice, 2550);
  assert.strictEqual(accepted.timeline.length, 2);
});

// TEST 8: Sell Now vs Wait produces explainable recommendation
test('TEST 8: Sell Now vs Wait evaluates upward trend and recommends WAIT with reasons', () => {
  const prices = [2100, 2150, 2220, 2280, 2350, 2420, 2500]; // clear upward momentum
  const result = PricePredictionEngine.evaluateSellOrWait({
    cropName: 'Tomato',
    currentPrice: 2500,
    historicalPrices: prices,
    horizonDays: 3,
    weatherSignal: { rainProbability: 70 }
  });
  assert.strictEqual(result.recommendation, 'WAIT');
  assert.ok(result.confidence >= 70);
  assert.ok(result.reasons.length >= 2);
  assert.ok(result.expectedNetGain > 0);
});

// TEST 9: Declining or flat trend produces SELL NOW
test('TEST 9: Softening price trend recommends SELL NOW to prevent storage loss', () => {
  const prices = [2600, 2550, 2500, 2480, 2450, 2420, 2400]; // downward momentum
  const result = PricePredictionEngine.evaluateSellOrWait({
    cropName: 'Tomato',
    currentPrice: 2400,
    historicalPrices: prices,
    horizonDays: 4
  });
  assert.strictEqual(result.recommendation, 'SELL_NOW');
  assert.ok(result.reasons.some(r => r.includes('storage')));
});

// TEST 10: Insufficient historical data results in LOW CONFIDENCE (never fake certainty)
test('TEST 10: Insufficient data yields LOW CONFIDENCE with honest fallback', () => {
  const result = PricePredictionEngine.evaluateSellOrWait({
    cropName: 'Tomato',
    currentPrice: 2400,
    historicalPrices: [2400], // only 1 data point!
    horizonDays: 3
  });
  assert.strictEqual(result.confidenceLevel, 'Low');
  assert.ok(result.confidence <= 40);
  assert.ok(result.reasons[0].includes('sufficient historical price data is unavailable'));
});

// TEST 11: Net Return Formula precision test
test('TEST 11: Net Return formula follows Net = Selling - Transport - Storage - Fees - Loss', () => {
  const net = NetReturnEngine.calculateNetReturn({
    sellingPrice: 2700,
    quantity: 1,
    transportCost: 250,
    storageCost: 50,
    platformFeeRate: 0.01,
    transactionCost: 20,
    expectedLoss: 80
  });
  // 2700 - 250 - 50 - 27 - 20 - 80 = 2273
  assert.strictEqual(net.netReturn, 2273);
});

console.log(`\n====================================================`);
console.log(`📊 RESULTS: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log(`====================================================`);
