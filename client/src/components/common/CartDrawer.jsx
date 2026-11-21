import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { orderService } from '../../services/orderService';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, AlertCircle, Truck, MapPin } from 'lucide-react';
import Button from './Button';
import SafeImage from './SafeImage';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { user } = useAuth();

  const [fulfillmentType, setFulfillmentType] = useState('Pickup'); // 'Pickup' or 'Delivery'
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCartOpen) return null;

  // Calculate member discount if applicable
  let discountPercent = 0;
  if (user?.plan) {
    if (user.plan.toLowerCase() === 'gold') discountPercent = 15;
    else if (user.plan.toLowerCase() === 'silver') discountPercent = 10;
    else if (user.plan.toLowerCase() === 'junior') discountPercent = 5;
  }

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discountAmount;
  const tax = Math.round(taxable * 0.05); // 5% GST
  const deliveryCharge = fulfillmentType === 'Delivery' ? (subtotal >= 2000 ? 0 : 100) : 0;
  const finalTotal = taxable + tax + deliveryCharge;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cart.length) return;

    if (fulfillmentType === 'Delivery' && !deliveryAddress.trim()) {
      setErrorMessage('Please provide your complete delivery address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || '',
          brand: item.brand || '',
          subtotal: item.price * item.quantity
        })),
        fulfillmentType: fulfillmentType === 'Delivery' ? 'Home Delivery' : 'Front Desk Pickup',
        deliveryAddress: fulfillmentType === 'Delivery' ? deliveryAddress.trim() : 'KHELORA Pro Shop Front Desk (Court 1 Wing)',
        paymentMethod,
        customerName: user?.name || 'Walk-in Club Guest',
        customerEmail: user?.email || 'guest@khelora.com',
        customerPhone: user?.phone || '+91 98765 00000',
        isCounterSale: false
      };

      const result = await orderService.createOrder(orderPayload);
      const createdOrder = result.order || result;
      const targetOrderId = createdOrder.orderId || createdOrder.id;

      // Clear cart & close drawer immediately after successful order creation
      clearCart();
      setIsCartOpen(false);

      // Redirect to dedicated Flipkart-style Order Confirmation page
      navigate(`/order-confirmation/${targetOrderId}`, {
        state: { order: createdOrder }
      });
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-forest-950 text-cream-50 flex items-center justify-between border-b border-forest-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-400/20 border border-gold-400/30 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-cream-50">Pro Shop Gear Cart</h3>
                <p className="text-xs text-gray-400">KHELORA Equipment & Apparel</p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto mb-4 border border-cream-200">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-serif text-lg font-bold text-gray-800">Your cart is empty</p>
                <p className="text-xs text-gray-500 mt-1 mb-6">
                  Explore our tournament rackets, balls, kitbags and professional apparel.
                </p>
                <Button variant="gold" onClick={() => setIsCartOpen(false)}>
                  Browse Pro Shop
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-4 divide-y divide-cream-200">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-4 first:pt-0 flex gap-3">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        category="tennis"
                        className="w-16 h-16 rounded-xl object-cover border border-cream-300 shrink-0 bg-cream-50"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-forest-950 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} each</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-cream-300 rounded-lg bg-cream-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 hover:bg-cream-200 text-gray-600 rounded-l transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-forest-950">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 hover:bg-cream-200 text-gray-600 rounded-r transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-forest-950">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fulfillment Option */}
                <div className="border-t border-cream-200 pt-4">
                  <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-2">
                    Fulfillment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('Pickup')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                        fulfillmentType === 'Pickup'
                          ? 'bg-forest-950 text-cream-50 border-forest-950 shadow-sm'
                          : 'bg-cream-100 text-gray-700 border-cream-300 hover:bg-cream-200'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Club Pickup (Free)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('Delivery')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                        fulfillmentType === 'Delivery'
                          ? 'bg-forest-950 text-cream-50 border-forest-950 shadow-sm'
                          : 'bg-cream-100 text-gray-700 border-cream-300 hover:bg-cream-200'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Home Delivery
                    </button>
                  </div>

                  {fulfillmentType === 'Delivery' ? (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold text-gray-700">Delivery Address</label>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          {subtotal >= 2000 ? 'Free Shipping Qualified' : 'Flat Rs. 100 Shipping'}
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street, apartment, building, landmark, pincode..."
                        className="w-full text-xs p-2.5 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900 focus:outline-none bg-cream-50"
                      />
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-gray-500 bg-cream-100 p-2.5 rounded-xl border border-cream-200">
                      Collect at <strong className="text-forest-950">Pro Shop Front Desk (Court 1 Wing)</strong>. Ready within 2 hours of payment.
                    </p>
                  )}
                </div>

                {/* Payment Option */}
                <div className="border-t border-cream-200 pt-4">
                  <label className="block text-xs font-bold text-forest-950 uppercase tracking-wider mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'Card', 'Cash'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          paymentMethod === m
                            ? 'bg-gold-500 text-forest-950 border-gold-600 shadow-sm'
                            : 'bg-cream-100 text-gray-700 border-cream-300 hover:bg-cream-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-cream-50 p-4 rounded-2xl border border-cream-300 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-forest-950">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{user?.plan} Member Discount ({discountPercent}%)</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  {fulfillmentType === 'Delivery' && (
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className={deliveryCharge === 0 ? 'font-bold text-emerald-700 uppercase' : 'font-semibold text-forest-950'}>
                        {deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-semibold text-forest-950">{formatCurrency(tax)}</span>
                  </div>

                  <div className="border-t border-cream-300 pt-2 flex justify-between text-sm font-bold text-forest-950">
                    <span>Total Amount</span>
                    <span className="text-base text-forest-900 font-extrabold">{formatCurrency(finalTotal)}</span>
                  </div>
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  loading={isSubmitting}
                  onClick={handleCheckout}
                  className="w-full shadow-lg font-bold flex items-center justify-center gap-2 text-forest-950"
                >
                  <span>Pay & Place Order ({formatCurrency(finalTotal)})</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
