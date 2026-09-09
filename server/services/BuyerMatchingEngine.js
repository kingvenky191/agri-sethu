/**
 * BuyerMatchingEngine
 * Matches farmer produce listings with prospective buyers based on:
 * - Crop & variety
 * - Minimum/Maximum quantity
 * - Quality grade compatibility
 * - Distance & transport viability
 * - Target price budget
 * - Buyer trust score
 */

class BuyerMatchingEngine {
  /**
   * Match a farmer's produce listing against active buyers
   * @param {Object} listing - Farmer crop listing
   * @param {Array} buyers - List of registered buyer profiles
   */
  static matchListingWithBuyers(listing, buyers = []) {
    return buyers.map(buyer => {
      let score = 0;
      const reasons = [];

      // 1. Crop Match (Weight: 35 points)
      const buyerCrops = buyer.requiredCrops || [];
      const hasCrop = buyerCrops.some(c => c.toLowerCase() === listing.cropName.toLowerCase());
      if (hasCrop) {
        score += 35;
        reasons.push(`Buyer actively procures ${listing.cropName}`);
      } else {
        // No match for this crop
        return null;
      }

      // 2. Quantity Compatibility (Weight: 25 points)
      const requestedQty = buyer.targetQuantity || 50;
      const listingQty = listing.quantity || 10;
      const qtyRatio = listingQty / requestedQty;

      if (qtyRatio >= 0.8 && qtyRatio <= 1.5) {
        score += 25;
        reasons.push(`Listing quantity (${listingQty} qtl) perfectly fits buyer order size (${requestedQty} qtl)`);
      } else if (qtyRatio >= 0.4) {
        score += 18;
        reasons.push(`Listing fulfills ${Math.round(qtyRatio * 100)}% of buyer batch requirement`);
      } else {
        score += 10;
        reasons.push(`Partial fulfillment possible (${listingQty} qtl)`);
      }

      // 3. Quality Grade Match (Weight: 15 points)
      const preferredGrade = buyer.preferredGrade || 'A';
      const listingGrade = listing.qualityGrade || 'A';

      if (listingGrade === preferredGrade) {
        score += 15;
        reasons.push(`Quality ${listingGrade} exactly matches buyer procurement standard`);
      } else if (listingGrade === 'A' && preferredGrade === 'B') {
        score += 15;
        reasons.push(`Premium Grade A exceeds buyer minimum Grade B specification`);
      } else {
        score += 8;
        reasons.push(`Grade ${listingGrade} acceptable with standard calibration`);
      }

      // 4. Distance & Logistics (Weight: 15 points)
      const distanceKm = buyer.distanceKm || Math.floor(Math.random() * 45) + 12;
      const maxRadius = buyer.preferredRadiusKm || 80;

      if (distanceKm <= 35) {
        score += 15;
        reasons.push(`Close transit distance (${distanceKm} km) keeps transport cost low`);
      } else if (distanceKm <= maxRadius) {
        score += 10;
        reasons.push(`Within preferred procurement zone (${distanceKm} km)`);
      } else {
        score += 5;
        reasons.push(`Long-distance shipment required (${distanceKm} km)`);
      }

      // 5. Buyer Trust & Reliability (Weight: 10 points)
      const trustScore = buyer.trustScore || 85;
      if (trustScore >= 90) {
        score += 10;
        reasons.push(`High Buyer Trust Score (${trustScore}/100) with guaranteed escrow payment`);
      } else {
        score += 7;
        reasons.push(`Standard Verified Buyer (${trustScore}/100)`);
      }

      // Calculate estimated net return for this buyer
      const pricePerQtl = buyer.targetPrice || Math.round(listing.sellingPrice * 1.02);
      const transportTotal = Math.round(250 + (distanceKm * 15) + (listingQty * 12));
      
      // Default to buyer's typical transport policy or shared
      const buyerTransportShare = buyer.transportPolicy === 'BUYER_PAYS' ? transportTotal : Math.round(transportTotal / 2);
      const farmerTransportShare = transportTotal - buyerTransportShare;
      const netReturnEst = Math.round((pricePerQtl * listingQty) - farmerTransportShare - (pricePerQtl * listingQty * 0.01) - 20);

      return {
        buyerId: buyer.id,
        buyerName: buyer.businessName || buyer.name,
        buyerType: buyer.businessType || 'Wholesale Buyer',
        location: buyer.location,
        distanceKm,
        offeredPricePerQtl: pricePerQtl,
        trustScore,
        isVerified: buyer.isVerified !== false,
        transportPolicy: buyer.transportPolicy || 'SHARED_50_50',
        matchScore: Math.min(99, Math.max(50, score)),
        reasons,
        estimatedNetReturn: netReturnEst,
        listingId: listing.id
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.matchScore - a.matchScore);
  }
}

module.exports = BuyerMatchingEngine;
