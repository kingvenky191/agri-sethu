/**
 * PaymentService
 * Sandboxed payment processor simulating UPI QR, NetBanking, and Direct Escrow Settlement.
 * Labeled clearly for SIH demonstration and architected for plug-in Razorpay/Cashfree integration.
 */

class PaymentService {
  static createPaymentSession({ orderId, amount, buyerName, buyerPhone }) {
    const txnId = `AGRI-TXN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const upiString = `upi://pay?pa=agrisethu.escrow@icici&pn=AgriSethuEscrow&am=${amount}&tr=${txnId}&cu=INR&tn=Order_${orderId}`;

    return {
      transactionId: txnId,
      orderId,
      amount,
      currency: 'INR',
      status: 'PENDING',
      isDemoMode: true,
      demoNotice: 'Demo Sandbox Payment: No real money is transferred.',
      paymentMethods: ['UPI_QR', 'UPI_VPA', 'NET_BANKING', 'NEFT_RTGS', 'ESCROW_WALLET'],
      upiDetails: {
        vpa: 'agrisethu.escrow@icici',
        qrPayload: upiString,
        payeeName: 'AgriSethu Farmer Escrow Trust'
      },
      bankDetails: {
        accountName: 'AgriSethu Escrow Settlement A/C',
        accountNumber: '9202613200845',
        ifsc: 'ICIC0000104',
        branch: 'Hyderabad Agri Hub'
      }
    };
  }

  static verifyAndCapturePayment({ transactionId, paymentMethod = 'UPI_QR' }) {
    return {
      transactionId,
      paymentMethod,
      status: 'CAPTURED',
      escrowState: 'FUNDS_HELD_IN_ESCROW',
      capturedAt: new Date().toISOString(),
      bankReferenceNumber: `UTR${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      receiptNumber: `RCP-${Math.floor(Math.random() * 90000 + 10000)}`,
      receiptNote: 'Payment successfully held in AgriSethu Escrow. Disbursed to farmer upon delivery sign-off.'
    };
  }
}

module.exports = PaymentService;
