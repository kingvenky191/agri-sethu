/**
 * NetReturnEngine
 * Central principle of AgriSethu: MAXIMUM NET RETURN, NOT simply maximum selling price.
 * 
 * Formula:
 * NET RETURN = Selling Price - Transport Cost - Storage Cost - Platform/Transaction Fee - Expected Loss
 */

class NetReturnEngine {
  /**
   * Calculate comprehensive net return for a farmer
   * @param {Object} params
   * @param {number} params.sellingPrice - Gross selling price per quintal/unit
   * @param {number} params.quantity - Quantity (quintals/units)
   * @param {number} params.transportCost - Farmer's share of transport cost
   * @param {number} params.storageCost - Storage expenses incurred or projected
   * @param {number} [params.platformFeeRate=0.01] - Platform fee rate (default 1%)
   * @param {number} [params.transactionCost=20] - Banking / settlement fee
   * @param {number} [params.expectedLoss=0] - Estimated spoilage/loss cost
   * @param {number} [params.baseProductionCost=1200] - Estimated cultivation cost per quintal for profit margin
   */
  static calculateNetReturn({
    sellingPrice = 0,
    quantity = 1,
    transportCost = 0,
    storageCost = 0,
    platformFeeRate = 0.01,
    transactionCost = 20,
    expectedLoss = 0,
    baseProductionCost = 1200
  }) {
    const grossRevenue = Math.round(sellingPrice * quantity);
    const platformFee = Math.round(grossRevenue * platformFeeRate);
    const totalTransport = Math.round(transportCost);
    const totalStorage = Math.round(storageCost);
    const totalExpectedLoss = Math.round(expectedLoss);
    const totalTransaction = Math.round(transactionCost);

    const totalDeductions = totalTransport + totalStorage + platformFee + totalTransaction + totalExpectedLoss;
    const netReturn = Math.max(0, grossRevenue - totalDeductions);
    const netReturnPerUnit = quantity > 0 ? Math.round((netReturn / quantity) * 100) / 100 : 0;

    const totalProductionCost = Math.round(baseProductionCost * quantity);
    const netProfit = netReturn - totalProductionCost;
    const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 1000) / 10 : 0;

    return {
      grossRevenue,
      sellingPricePerUnit: sellingPrice,
      quantity,
      deductions: {
        transport: totalTransport,
        storage: totalStorage,
        platformFee,
        transactionFee: totalTransaction,
        expectedLoss: totalExpectedLoss,
        total: totalDeductions
      },
      netReturn,
      netReturnPerUnit,
      baseProductionCost: totalProductionCost,
      netProfit,
      profitMargin,
      insight: this.generateInsight(sellingPrice, netReturnPerUnit, totalDeductions, quantity)
    };
  }

  /**
   * Explainable insight explaining why net return matters
   */
  static generateInsight(sellingPrice, netReturnPerUnit, totalDeductions, quantity) {
    const deductionsPerUnit = quantity > 0 ? Math.round(totalDeductions / quantity) : 0;
    const leakagePercent = sellingPrice > 0 ? Math.round((deductionsPerUnit / sellingPrice) * 100) : 0;

    if (leakagePercent > 20) {
      return `⚠️ Watch out: Logistics and storage eat up ${leakagePercent}% (₹${deductionsPerUnit}/qtl) of your gross price. Selecting buyer-paid transport or nearer buyers can save up to ₹${Math.round(totalDeductions * 0.6)}.`;
    } else if (leakagePercent > 10) {
      return `💡 Moderate deductions of ${leakagePercent}% (₹${deductionsPerUnit}/qtl). You retain ₹${netReturnPerUnit}/qtl (${100 - leakagePercent}% of gross value).`;
    } else {
      return `✅ Excellent cost efficiency! You retain ₹${netReturnPerUnit}/qtl (${100 - leakagePercent}% of gross selling price).`;
    }
  }

  /**
   * Compare multiple offers or routes and rank by MAXIMUM NET RETURN
   */
  static compareOptions(options, baseProductionCost = 1200) {
    const evaluated = options.map(opt => {
      const calculation = this.calculateNetReturn({
        sellingPrice: opt.sellingPrice,
        quantity: opt.quantity || 1,
        transportCost: opt.farmerTransportCost || opt.transportCost || 0,
        storageCost: opt.storageCost || 0,
        platformFeeRate: opt.platformFeeRate !== undefined ? opt.platformFeeRate : 0.01,
        transactionCost: opt.transactionCost !== undefined ? opt.transactionCost : 20,
        expectedLoss: opt.expectedLoss || 0,
        baseProductionCost
      });

      return {
        ...opt,
        calculation,
        netReturn: calculation.netReturn,
        netReturnPerUnit: calculation.netReturnPerUnit,
        totalDeductions: calculation.deductions.total
      };
    });

    // Rank strictly by netReturn descending
    evaluated.sort((a, b) => b.netReturn - a.netReturn);

    // Mark best option and calculate advantage over other options
    if (evaluated.length > 0) {
      const top = evaluated[0];
      top.isBestOption = true;

      evaluated.forEach((opt, idx) => {
        if (idx === 0) {
          opt.advantage = evaluated.length > 1 ? top.netReturn - evaluated[1].netReturn : 0;
          opt.badge = '🏆 BEST NET RETURN';
        } else {
          opt.differenceFromBest = top.netReturn - opt.netReturn;
        }
      });
    }

    return evaluated;
  }
}

module.exports = NetReturnEngine;
