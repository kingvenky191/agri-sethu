/**
 * TransportCalculator
 * Handles multi-party transport cost-sharing and dynamically computes
 * the buyer's total payable and the farmer's net take-home earnings.
 */

class TransportCalculator {
  /**
   * Estimate total transport cost based on distance and load
   * @param {Object} params
   * @param {number} params.distanceKm - Distance in kilometers
   * @param {number} params.quantityQuintals - Load in quintals (1 quintal = 100kg)
   * @param {string} [params.vehicleType] - 'mini_truck' | 'pickup' | 'heavy_truck'
   */
  static estimateTotalTransport({ distanceKm = 10, quantityQuintals = 10, vehicleType }) {
    let ratePerKm = 14;
    let baseRate = 250;
    let recommendedVehicle = 'Pickup (1 Ton)';

    if (quantityQuintals <= 15) {
      ratePerKm = 12;
      baseRate = 200;
      recommendedVehicle = 'Mini Auto / Tata Ace';
    } else if (quantityQuintals <= 40) {
      ratePerKm = 18;
      baseRate = 350;
      recommendedVehicle = 'Pickup (1.5 - 2 Ton)';
    } else {
      ratePerKm = 28;
      baseRate = 600;
      recommendedVehicle = 'Heavy Truck (5+ Ton)';
    }

    // Per quintal handling/loading surcharge
    const loadingUnloadingFee = Math.round(quantityQuintals * 15);
    const transportTotal = Math.round(baseRate + (distanceKm * ratePerKm) + loadingUnloadingFee);

    return {
      distanceKm,
      quantityQuintals,
      vehicleType: vehicleType || recommendedVehicle,
      ratePerKm,
      baseRate,
      loadingUnloadingFee,
      transportTotal
    };
  }

  /**
   * Calculate shares and impact on buyer payable and farmer net return
   * @param {Object} params
   * @param {number} params.produceValue - Total value of produce (sellingPrice * quantity)
   * @param {number} params.transportTotal - Total cost of transport
   * @param {string} params.responsibility - 'BUYER_PAYS' | 'FARMER_PAYS' | 'SHARED_50_50' | 'CUSTOM_SPLIT'
   * @param {number} [params.customBuyerAmount] - Custom buyer share if CUSTOM_SPLIT
   * @param {number} [params.storageCost=0] - Incurred storage cost
   * @param {number} [params.expectedLoss=0] - Incurred/projected spoilage loss
   * @param {number} [params.platformFeeRate=0.01] - Platform fee (1%)
   */
  static calculateShares({
    produceValue = 0,
    transportTotal = 0,
    responsibility = 'SHARED_50_50',
    customBuyerAmount = null,
    storageCost = 0,
    expectedLoss = 0,
    platformFeeRate = 0.01
  }) {
    let buyerTransportShare = 0;
    let farmerTransportShare = 0;

    switch (responsibility) {
      case 'BUYER_PAYS':
        buyerTransportShare = transportTotal;
        farmerTransportShare = 0;
        break;

      case 'FARMER_PAYS':
        buyerTransportShare = 0;
        farmerTransportShare = transportTotal;
        break;

      case 'SHARED_50_50':
        buyerTransportShare = Math.round(transportTotal / 2);
        farmerTransportShare = transportTotal - buyerTransportShare;
        break;

      case 'CUSTOM_SPLIT':
        if (customBuyerAmount !== null && customBuyerAmount !== undefined) {
          buyerTransportShare = Math.min(transportTotal, Math.max(0, Math.round(customBuyerAmount)));
          farmerTransportShare = transportTotal - buyerTransportShare;
        } else {
          buyerTransportShare = Math.round(transportTotal / 2);
          farmerTransportShare = transportTotal - buyerTransportShare;
        }
        break;

      default:
        buyerTransportShare = Math.round(transportTotal / 2);
        farmerTransportShare = transportTotal - buyerTransportShare;
    }

    // Platform fee (1% of produce value)
    const platformFee = Math.round(produceValue * platformFeeRate);
    const buyerHandlingFee = 50; // nominal buyer processing fee
    const farmerTransactionFee = 20; // nominal farmer disbursement fee

    // Buyer Payable Amount = Produce Value + Buyer Transport Share + Buyer Handling Fee
    const buyerTotalPayable = Math.round(produceValue + buyerTransportShare + buyerHandlingFee);

    // Farmer Net Return = Produce Value - Farmer Transport Share - Storage - Spoilage - Platform Fee - Transaction Fee
    const farmerDeductions = Math.round(farmerTransportShare + storageCost + expectedLoss + platformFee + farmerTransactionFee);
    const farmerNetReturn = Math.max(0, Math.round(produceValue - farmerDeductions));

    return {
      produceValue,
      transportTotal,
      responsibility,
      buyerTransportShare,
      farmerTransportShare,
      buyerSummary: {
        produceCost: produceValue,
        transportShare: buyerTransportShare,
        handlingFee: buyerHandlingFee,
        totalPayable: buyerTotalPayable
      },
      farmerSummary: {
        grossSellingPrice: produceValue,
        transportDeduction: farmerTransportShare,
        storageCost,
        expectedLoss,
        platformFee,
        transactionFee: farmerTransactionFee,
        totalDeductions: farmerDeductions,
        netReturn: farmerNetReturn
      },
      explanation: this.generateResponsibilityExplanation(responsibility, buyerTransportShare, farmerTransportShare, transportTotal)
    };
  }

  static generateResponsibilityExplanation(mode, buyerShare, farmerShare, total) {
    if (mode === 'BUYER_PAYS') {
      return `🎉 Buyer covers 100% of transport (₹${total}). Farmer pays ₹0, maximizing net return!`;
    } else if (mode === 'FARMER_PAYS') {
      return `⚠️ Farmer pays 100% of transport (₹${total}). Deducted directly from farmer earnings.`;
    } else if (mode === 'SHARED_50_50') {
      return `🤝 Fair 50/50 cost sharing: Buyer contributes ₹${buyerShare} and Farmer contributes ₹${farmerShare}.`;
    } else {
      return `📝 Custom split agreed: Buyer ₹${buyerShare} (${Math.round((buyerShare / (total || 1)) * 100)}%), Farmer ₹${farmerShare} (${Math.round((farmerShare / (total || 1)) * 100)}%).`;
    }
  }
}

module.exports = TransportCalculator;
