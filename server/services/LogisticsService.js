/**
 * LogisticsService
 * Calculates distances, route times, vehicle allocation, and shipment tracking.
 */

class LogisticsService {
  /**
   * Calculate logistics parameters for an order
   */
  static planShipment({ origin, destination, quantityQuintals = 20 }) {
    // Generate realistic distance based on locations or default 35 km
    const distanceKm = Math.floor(Math.random() * 45) + 15;
    const speedKmh = 35; // average rural/suburban truck transit speed
    const transitHours = Math.max(1, Math.round((distanceKm / speedKmh) * 10) / 10);

    let vehicleType = 'Pickup (1.5 Ton)';
    let vehicleCapacity = 25; // quintals
    let costPerKm = 16;

    if (quantityQuintals <= 12) {
      vehicleType = 'Mini Auto (Tata Ace)';
      vehicleCapacity = 12;
      costPerKm = 12;
    } else if (quantityQuintals <= 35) {
      vehicleType = 'Pickup Truck (Mahindra Bolero Maxi)';
      vehicleCapacity = 35;
      costPerKm = 18;
    } else {
      vehicleType = 'Eicher 14-ft Truck (5 Ton)';
      vehicleCapacity = 60;
      costPerKm = 26;
    }

    const baseFare = 250;
    const transportTotal = Math.round(baseFare + (distanceKm * costPerKm) + (quantityQuintals * 15));

    return {
      origin: origin || 'Farmer Farmgate, Warangal',
      destination: destination || 'Buyer Central Depot, Hyderabad',
      distanceKm,
      transitHours,
      estimatedDeliveryTime: `${transitHours} to ${transitHours + 1.5} hours`,
      vehicle: {
        type: vehicleType,
        capacityQuintals: vehicleCapacity,
        coolingSupported: false,
        gpsTrackingEnabled: true
      },
      pricing: {
        baseFare,
        ratePerKm: costPerKm,
        handlingCharges: quantityQuintals * 15,
        totalCost: transportTotal
      },
      driver: {
        name: 'Srinivas Rao',
        phone: '+91 98480 23114',
        vehicleNumber: 'TS 03 UA 7824',
        rating: 4.85
      }
    };
  }

  /**
   * Generate live tracking timeline for an order
   */
  static getTrackingTimeline(order) {
    const statusOrder = ['PLACED', 'CONFIRMED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
    const currentIdx = statusOrder.indexOf(order.status || 'PLACED');

    const steps = [
      {
        key: 'PLACED',
        label: 'Order Placed & Escrow Secured',
        description: 'Buyer confirmed order and escrow payment is verified',
        time: order.createdAt,
        completed: currentIdx >= 0
      },
      {
        key: 'CONFIRMED',
        label: 'Farmer Accepted & Booking Locked',
        description: 'Produce harvest ready, transport option agreed',
        time: order.confirmedAt || 'Verified',
        completed: currentIdx >= 1
      },
      {
        key: 'PREPARING',
        label: 'Quality Check & Crating at Farmgate',
        description: 'Produce weighed, graded and packed for loading',
        time: order.preparingAt || 'Completed at Farm',
        completed: currentIdx >= 2
      },
      {
        key: 'IN_TRANSIT',
        label: 'Picked Up & En Route',
        description: 'Logistics vehicle dispatched, live GPS active',
        time: order.dispatchedAt || 'On Highway',
        completed: currentIdx >= 3
      },
      {
        key: 'DELIVERED',
        label: 'Delivered at Destination',
        description: 'Produce verified by buyer at unloading bay',
        time: order.deliveredAt || 'Pending Delivery',
        completed: currentIdx >= 4
      },
      {
        key: 'COMPLETED',
        label: 'Payment Disbursed to Farmer',
        description: 'Instant settlement credited to farmer bank account',
        time: order.completedAt || 'Pending Settlement',
        completed: currentIdx >= 5
      }
    ];

    return steps;
  }
}

module.exports = LogisticsService;
