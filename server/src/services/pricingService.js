import { Member, MembershipPlan } from '../models/index.js';

export const pricingService = {
  async getMemberDiscount(memberId, category = 'shop') {
    if (!memberId) return 0;
    const member = await Member.findOne({ id: memberId });
    if (!member || member.status !== 'active') return 0;

    const plan = await MembershipPlan.findOne({ name: new RegExp(`^${member.plan}$`, 'i') });
    if (!plan) return 0;

    if (category === 'shop' || category === 'bar') {
      return plan.shopDiscountPercent || 0;
    }
    if (category === 'court') {
      return plan.courtDiscountPercent || 0;
    }
    return 0;
  },

  async calculateShopTotal(items, memberId = null, fulfillmentType = 'Pickup') {
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.price) * Number(item.quantity);
    }
    const discountPercent = await this.getMemberDiscount(memberId, 'shop');
    const discount = Math.round((subtotal * discountPercent) / 100);
    const taxable = subtotal - discount;
    const tax = Math.round(taxable * 0.05); // 5% GST on sports equipment

    // Delivery charge: Free delivery on orders >= Rs. 2000, else Rs. 100 for Home Delivery; 0 for pickup
    const isDelivery = fulfillmentType === 'Delivery' || fulfillmentType === 'Home Delivery';
    const deliveryCharge = isDelivery ? (subtotal >= 2000 ? 0 : 100) : 0;
    const total = taxable + tax + deliveryCharge;

    return {
      subtotal,
      discountPercent,
      discount,
      deliveryCharge,
      tax,
      total
    };
  },

  async calculateBarTotal(items, memberId = null) {
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    const discountPercent = await this.getMemberDiscount(memberId, 'bar');
    const discount = Math.round((subtotal * discountPercent) / 100);
    const taxable = subtotal - discount;
    const tax = Math.round(taxable * 0.05); // 5% GST on F&B
    const total = taxable + tax;

    return {
      subtotal,
      discountPercent,
      discount,
      tax,
      total
    };
  }
};

export default pricingService;
