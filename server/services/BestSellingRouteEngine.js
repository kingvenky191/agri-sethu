const NetReturnEngine = require('./NetReturnEngine');

/**
 * BestSellingRouteEngine
 * Compares all available selling routes / market channels for a farmer:
 * - Local APMC Mandi
 * - City Wholesale Mandi
 * - Food Processing Industry
 * - Direct Commercial Retailer
 * - Farmer Producer Organization (FPO)
 * 
 * Ranks all channels strictly by MAXIMUM NET RETURN.
 */

class BestSellingRouteEngine {
  /**
   * Evaluate best selling route
   * @param {Object} params
   * @param {string} params.cropName
   * @param {number} params.quantity - In quintals
   * @param {string} [params.farmerLocation='Warangal']
   * @param {string} [params.qualityGrade='A']
   * @param {Array} [params.customBuyers=[]]
   */
  static evaluateRoutes({
    cropName = 'Tomato',
    quantity = 50,
    farmerLocation = 'Warangal',
    qualityGrade = 'A',
    customBuyers = []
  }) {
    // Base benchmark prices by crop (Grade A)
    const baseBench = {
      Tomato: 2400,
      Chilli: 18500,
      Cotton: 7200,
      Rice: 3400,
      Maize: 2150,
      Onion: 2600,
      Potato: 1800
    };

    const benchmark = baseBench[cropName] || 2500;
    const gradeFactor = qualityGrade === 'A' ? 1.05 : (qualityGrade === 'B' ? 1.0 : 0.90);

    // Channel profiles
    const rawChannels = [
      {
        id: 'local_mandi',
        name: 'Warangal APMC Local Mandi',
        channelType: 'Local Mandi',
        distanceKm: 14,
        sellingPrice: Math.round(benchmark * 0.96 * gradeFactor),
        transportCostTotal: Math.round(quantity * 35),
        farmerTransportShare: Math.round(quantity * 35), // farmer pays transport to mandi
        storageCost: 0,
        platformFeeRate: 0,
        apmcCessRate: 0.02, // 2% mandi cess
        expectedLossRate: 0.015, // 1.5% handling loss
        timeToSell: 'Same Day (4 Hours)',
        paymentSpeed: '24-48 Hours via RTGS',
        trustRating: 4.2
      },
      {
        id: 'city_mandi',
        name: 'Hyderabad Bowenpally Terminal Mandi',
        channelType: 'City Wholesale Mandi',
        distanceKm: 145,
        sellingPrice: Math.round(benchmark * 1.08 * gradeFactor), // higher gross price
        transportCostTotal: Math.round(quantity * 160),
        farmerTransportShare: Math.round(quantity * 160), // long distance transport
        storageCost: Math.round(quantity * 25),
        platformFeeRate: 0,
        apmcCessRate: 0.025, // 2.5% city mandi cess + commission
        expectedLossRate: 0.04, // 4% spoilage in long transit
        timeToSell: '1-2 Days',
        paymentSpeed: '48-72 Hours',
        trustRating: 4.0
      },
      {
        id: 'processor',
        name: 'Kisan Agro Processing Hub (Direct)',
        channelType: 'Food Processing Industry',
        distanceKm: 32,
        sellingPrice: Math.round(benchmark * 1.04 * gradeFactor),
        transportCostTotal: Math.round(quantity * 60),
        farmerTransportShare: 0, // Processor pays transport!
        storageCost: 0,
        platformFeeRate: 0.01,
        apmcCessRate: 0, // Zero mandi cess for direct purchase
        expectedLossRate: 0.005, // 0.5% minimal loss
        timeToSell: 'Next Day Pickup',
        paymentSpeed: 'Instant Direct Bank Transfer',
        trustRating: 4.9
      },
      {
        id: 'direct_retailer',
        name: 'FreshMart Supermarkets Supply',
        channelType: 'Direct Commercial Retailer',
        distanceKm: 48,
        sellingPrice: Math.round(benchmark * 1.06 * gradeFactor),
        transportCostTotal: Math.round(quantity * 75),
        farmerTransportShare: Math.round(quantity * 37.5), // 50/50 transport split
        storageCost: 0,
        platformFeeRate: 0.01,
        apmcCessRate: 0,
        expectedLossRate: 0.01,
        timeToSell: '24 Hours',
        paymentSpeed: 'Within 24 Hours',
        trustRating: 4.8
      },
      {
        id: 'fpo_coop',
        name: 'Telangana Rythu Mithra FPO',
        channelType: 'Farmer Producer Organization',
        distanceKm: 18,
        sellingPrice: Math.round(benchmark * 0.99 * gradeFactor),
        transportCostTotal: Math.round(quantity * 40),
        farmerTransportShare: Math.round(quantity * 20), // subsidized logistics
        storageCost: 0,
        platformFeeRate: 0.005, // 0.5% minimal co-op fee
        apmcCessRate: 0,
        expectedLossRate: 0.008,
        timeToSell: 'Same Day Collection',
        paymentSpeed: 'Instant Cash / Bank Transfer',
        trustRating: 4.7
      }
    ];

    // Compute Net Return for all channels using NetReturnEngine
    const evaluatedRoutes = rawChannels.map(channel => {
      const grossRevenue = Math.round(channel.sellingPrice * quantity);
      const transportCost = channel.farmerTransportShare;
      const storageCost = channel.storageCost;
      const cessAndFee = Math.round(grossRevenue * (channel.apmcCessRate + channel.platformFeeRate));
      const expectedLoss = Math.round(grossRevenue * channel.expectedLossRate);
      const transactionCost = 20;

      const totalDeductions = transportCost + storageCost + cessAndFee + expectedLoss + transactionCost;
      const netReturn = Math.max(0, grossRevenue - totalDeductions);
      const netReturnPerQtl = Math.round(netReturn / quantity);

      return {
        ...channel,
        grossRevenue,
        deductions: {
          transport: transportCost,
          storage: storageCost,
          feesAndTaxes: cessAndFee,
          expectedLoss,
          transactionCost,
          total: totalDeductions
        },
        netReturn,
        netReturnPerQtl,
        profitMarginPercent: Math.round(((netReturn - (quantity * 1300)) / (grossRevenue || 1)) * 1000) / 10
      };
    });

    // Rank strictly by netReturn descending
    evaluatedRoutes.sort((a, b) => b.netReturn - a.netReturn);

    // Mark winner and attach insights
    const best = evaluatedRoutes[0];
    best.isBest = true;
    best.badge = '🏆 BEST NET RETURN';

    // Find highest gross selling price to highlight difference
    const highestGrossOption = [...evaluatedRoutes].sort((a, b) => b.sellingPrice - a.sellingPrice)[0];

    let netReturnAdvantageInsight = '';
    if (highestGrossOption.id !== best.id) {
      const netDiff = best.netReturn - highestGrossOption.netReturn;
      netReturnAdvantageInsight = `Notice: Although ${highestGrossOption.name} offers a higher gross price (₹${highestGrossOption.sellingPrice}/qtl vs ₹${best.sellingPrice}/qtl), ${best.name} gives you ₹${netDiff.toLocaleString('en-IN')} MORE NET RETURN because of zero transport deductions and no intermediary commission.`;
    } else {
      netReturnAdvantageInsight = `${best.name} gives both the highest gross market price and the maximum net take-home return.`;
    }

    return {
      cropName,
      quantity,
      qualityGrade,
      routes: evaluatedRoutes,
      bestRoute: best,
      highestGrossOption,
      insight: netReturnAdvantageInsight
    };
  }
}

module.exports = BestSellingRouteEngine;
