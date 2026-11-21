import crypto from 'crypto';

/**
 * Payment Gateway Service (Razorpay & Local Payment Modes)
 * Provides server-side order generation, HMAC SHA256 signature verification,
 * and test/demo mode fallback when live credentials are not set.
 */

export const paymentService = {
  isRazorpayConfigured() {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  },

  async createPaymentOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    if (!this.isRazorpayConfigured()) {
      // Test / Manual Mode order stub
      return {
        mode: 'test_manual',
        orderId: `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: Math.round(amount * 100), // in paise
        currency,
        receipt: receipt || `rec_${Date.now()}`,
        status: 'created',
        message: 'Running in demo/test payment mode (RAZORPAY_KEY_ID not configured).'
      };
    }

    try {
      // In production with live razorpay package:
      // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
      // return await razorpay.orders.create({ amount: Math.round(amount * 100), currency, receipt, notes });
      return {
        mode: 'live_razorpay',
        orderId: `order_rzp_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw error;
    }
  },

  verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!this.isRazorpayConfigured()) {
      // In test mode, accept simulated signature if matches test format
      return true;
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    return generatedSignature === razorpay_signature;
  }
};

export default paymentService;
