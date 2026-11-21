import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CheckCircle2,
  Copy,
  Check,
  ShoppingBag,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  Printer,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import SafeImage from '../../components/common/SafeImage';

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (!order && orderId) {
      setLoading(true);
      orderService.getOrderById(orderId)
        .then((data) => {
          setOrder(data);
          setError('');
        })
        .catch((err) => {
          setError(err.message || 'Failed to retrieve order confirmation details.');
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, order]);

  const handleCopyOrderId = () => {
    if (!order) return;
    const idToCopy = order.orderId || order.id;
    navigator.clipboard.writeText(idToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader message="Confirming your order..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-cream-300 shadow-premium text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Order Not Found</h2>
          <p className="text-xs text-gray-500">{error || 'Could not locate order details for the requested ID.'}</p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/shop')}>
              Return to Pro Shop
            </Button>
            <Button variant="outline" onClick={() => navigate('/member/orders')}>
              My Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isHomeDelivery = order.fulfillmentType === 'Home Delivery' || order.fulfillmentType === 'Delivery';
  const effectiveOrderId = order.orderId || order.id;

  return (
    <div className="min-h-screen bg-cream-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Flipkart-Style Green Success Banner */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-emerald-200 shadow-premium text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 mb-5 shadow-inner">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 tracking-tight">
            Your Order Has Been Placed Successfully!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-lg mx-auto">
            Thank you for shopping with <strong className="text-forest-950">KHELORA Pro Shop</strong>. A confirmation email has been logged to <span className="font-semibold text-forest-900">{order.customerEmail || 'your profile'}</span>.
          </p>

          {/* Unique Order ID Pill */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-cream-100 px-5 py-3 rounded-2xl border border-cream-300">
            <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Order ID:</span>
            <span className="font-mono font-bold text-forest-950 text-sm sm:text-base tracking-wide">
              {effectiveOrderId}
            </span>
            <button
              onClick={handleCopyOrderId}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-cream-300 text-gray-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
              title="Copy Order ID"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-[11px] text-gray-500 flex items-center justify-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Placed on {formatDate(order.createdAt)}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Payment Verified ({order.paymentMethod})
            </span>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="mt-8 pt-6 border-t border-cream-200 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <Button
              variant="primary"
              size="md"
              className="font-bold flex items-center gap-1.5"
              onClick={() => navigate(`/member/orders/${effectiveOrderId}`)}
            >
              <span>View Order Details</span>
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="md"
              className="font-semibold flex items-center gap-1.5"
              onClick={() => navigate(`/member/orders/${effectiveOrderId}#tracking`)}
            >
              <Truck className="w-4 h-4 text-forest-900" />
              <span>Track Order</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              className="font-semibold flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 text-forest-900" />
              <span>Print Invoice</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              className="font-semibold"
              onClick={() => navigate('/shop')}
            >
              <span>Continue Shopping</span>
            </Button>
          </div>
        </div>

        {/* Fulfillment & Destination Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-premium space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
              <div className="w-9 h-9 rounded-xl bg-forest-900/10 flex items-center justify-center text-forest-900">
                {isHomeDelivery ? <Truck className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-forest-950">
                  {isHomeDelivery ? 'Doorstep Delivery' : 'Front Desk Counter Pickup'}
                </h3>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                  {order.fulfillmentType}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <p className="font-semibold text-forest-950">
                Recipient: <span className="font-normal">{order.customerName}</span>
              </p>
              {order.customerPhone && (
                <p className="font-semibold text-forest-950">
                  Contact: <span className="font-normal font-mono">{order.customerPhone}</span>
                </p>
              )}
              <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
                <span className="font-semibold text-forest-900 block mb-1">
                  {isHomeDelivery ? 'Shipping Destination:' : 'Pickup Station:'}
                </span>
                <p className="text-gray-600 leading-relaxed">{order.deliveryAddress}</p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                <Clock className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {isHomeDelivery
                    ? 'Estimated Delivery: 2-3 Business Days'
                    : 'Collection Window: Ready in 2 Hours (Open 6:00 AM - 10:00 PM)'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Billing Card */}
          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-premium space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
              <div className="w-9 h-9 rounded-xl bg-forest-900/10 flex items-center justify-center text-forest-900">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-forest-950">Payment Details</h3>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                  Invoice Ref: {order.invoiceReference || `INV-${effectiveOrderId}`}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-bold text-forest-950 px-2.5 py-0.5 rounded-lg bg-cream-100 border border-cream-300">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-bold text-emerald-800 uppercase px-2.5 py-0.5 rounded-full bg-emerald-100">
                  {order.paymentStatus || 'PAID'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600">Order Status:</span>
                <span className="font-bold text-forest-950 uppercase px-2.5 py-0.5 rounded-full bg-gold-400/30 text-forest-950">
                  {order.orderStatus}
                </span>
              </div>

              <div className="pt-2 border-t border-cream-200 flex justify-between items-center text-sm font-bold text-forest-950">
                <span>Total Amount Paid:</span>
                <span className="text-base text-forest-900 font-extrabold">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-premium space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-cream-200">
            <h3 className="font-serif font-bold text-lg text-forest-950">
              Purchased Equipment ({order.items?.length || 0} items)
            </h3>
            <span className="text-xs text-gray-500">Official Pro Shop Products</span>
          </div>

          <div className="divide-y divide-cream-200">
            {order.items?.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    category="tennis"
                    className="w-16 h-16 rounded-2xl object-cover border border-cream-300 bg-cream-50 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-forest-950 truncate">{item.name}</h4>
                    {item.brand && (
                      <p className="text-xs text-gray-500 font-semibold">{item.brand}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                      <span className="font-semibold text-forest-900 font-mono">Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>{formatCurrency(item.price)} each</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm sm:text-base font-bold text-forest-950">
                    {formatCurrency(item.total || item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Calculation Summary Table */}
          <div className="pt-6 border-t border-cream-200">
            <div className="max-w-xs ml-auto space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-forest-950">{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Membership Privilege Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              {isHomeDelivery && (
                <div className="flex justify-between">
                  <span>Courier Delivery Fee:</span>
                  <span className={order.deliveryCharge === 0 ? 'font-bold text-emerald-700 uppercase' : 'font-semibold text-forest-950'}>
                    {order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Goods & Service Tax (GST 5%):</span>
                <span className="font-semibold text-forest-950">{formatCurrency(order.tax)}</span>
              </div>

              <div className="border-t border-cream-300 pt-2 flex justify-between text-sm font-extrabold text-forest-950">
                <span>Grand Total:</span>
                <span className="text-base text-forest-900">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Guarantee & Contact */}
        <div className="bg-forest-950 text-cream-50 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-serif font-bold text-base text-cream-50">Need assistance with your equipment order?</h4>
            <p className="text-xs text-gray-400">Our Pro Shop team is available at the front desk or via telephone.</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="gold"
              size="md"
              className="font-bold"
              onClick={() => navigate('/contact')}
            >
              Contact Support
            </Button>
            <Button
              variant="outline"
              size="md"
              className="text-white border-white/20 hover:bg-white/10"
              onClick={() => navigate('/member/orders')}
            >
              View All Orders
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
