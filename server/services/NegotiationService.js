/**
 * NegotiationService
 * Manages bilateral price negotiation and counter-offers between buyers and farmers.
 */

class NegotiationService {
  /**
   * Process a new offer from buyer
   */
  static createOffer({ listing, buyer, offeredPrice, quantity, transportResponsibility = 'SHARED_50_50', note = '' }) {
    const originalPrice = listing.sellingPrice;
    const diff = offeredPrice - originalPrice;
    const percentDiff = Math.round((diff / originalPrice) * 1000) / 10;

    return {
      listingId: listing.id,
      buyerId: buyer.id,
      buyerName: buyer.businessName || buyer.name,
      farmerId: listing.farmerId,
      cropName: listing.cropName,
      quantity: quantity || listing.quantity,
      originalPrice,
      offeredPrice,
      priceDiff: diff,
      priceDiffPercent: percentDiff,
      transportResponsibility,
      status: 'PENDING_FARMER_REVIEW', // 'PENDING_FARMER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED'
      note,
      timeline: [
        {
          action: 'OFFER_MADE',
          actor: buyer.name || 'Buyer',
          role: 'buyer',
          price: offeredPrice,
          transport: transportResponsibility,
          timestamp: new Date().toISOString(),
          note
        }
      ]
    };
  }

  /**
   * Process a farmer's response: Accept, Reject, or Counter-Offer
   */
  static respondToOffer({ offer, responseType, counterPrice, counterTransport, responseNote = '' }) {
    const updatedOffer = { ...offer };

    if (responseType === 'ACCEPT') {
      updatedOffer.status = 'ACCEPTED';
      updatedOffer.finalAgreedPrice = offer.offeredPrice;
      updatedOffer.finalTransportResponsibility = offer.transportResponsibility;
      updatedOffer.timeline.push({
        action: 'OFFER_ACCEPTED',
        actor: 'Farmer',
        role: 'farmer',
        price: offer.offeredPrice,
        timestamp: new Date().toISOString(),
        note: responseNote || 'Agreed to terms. Ready for order confirmation.'
      });
    } else if (responseType === 'REJECT') {
      updatedOffer.status = 'REJECTED';
      updatedOffer.timeline.push({
        action: 'OFFER_REJECTED',
        actor: 'Farmer',
        role: 'farmer',
        timestamp: new Date().toISOString(),
        note: responseNote || 'Offer declined. Price below minimum threshold.'
      });
    } else if (responseType === 'COUNTER') {
      updatedOffer.status = 'PENDING_BUYER_REVIEW';
      updatedOffer.counterPrice = counterPrice;
      updatedOffer.counterTransport = counterTransport || offer.transportResponsibility;
      updatedOffer.timeline.push({
        action: 'COUNTER_OFFER_MADE',
        actor: 'Farmer',
        role: 'farmer',
        price: counterPrice,
        transport: counterTransport || offer.transportResponsibility,
        timestamp: new Date().toISOString(),
        note: responseNote || `Farmer proposed ₹${counterPrice}/qtl counter price.`
      });
    }

    return updatedOffer;
  }
}

module.exports = NegotiationService;
