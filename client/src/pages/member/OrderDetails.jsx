import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CreditCard,
  Printer,
  ShoppingBag,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Package,
  Calendar,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import SafeImage from '../../components/common/SafeImage';

export const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Cancellation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered wrong item or size');
  const [customComment, setCustomComment] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Invoice Modal state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const [orderRes, trackRes] = await Promise.all([
        orderService.getOrderById(orderId),
        orderService.getOrderTracking(orderId).catch(() => null)
      ]);
      setOrder(orderRes);
      setTrackingData(trackRes);
    } catch (err) {
      setError(err.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleCopyOrderId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId || order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    const finalReason = customComment.trim()
      ? `${cancelReason}: ${customComment.trim()}`
      : cancelReason;

    try {
      setCancelling(true);
      setCancelError('');
      const res = await orderService.cancelOrder(order.orderId || order.id, finalReason);
      setCancelModalOpen(false);
      // Reload order details
      fetchOrderDetails();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  const handleBuyAgain = (item) => {
    addToCart({
      id: item.productId,
      name: item.name,
      price: item.price,
      brand: item.brand,
      image: item.image
    });
    setIsCartOpen(true);
  };

  const handleBuyAllAgain = () => {
    if (!order?.items) return;
    order.items.forEach((item) => {
      addToCart({
        id: item.productId,
        name: item.name,
        price: item.price,
        brand: item.brand,
        image: item.image
      });
    });
    setIsCartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader message="Loading order details & tracking..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-cream-300 shadow-premium text-center space-y-4 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif font-bold text-forest-950">Could Not Load Order</h2>
        <p className="text-xs text-gray-500">{error || 'Order record not found.'}</p>
        <div className="pt-2 flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate('/member/orders')}>
            Back to My Orders
          </Button>
          <Button variant="outline" onClick={fetchOrderDetails}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const effectiveOrderId = order.orderId || order.id;
  const isHomeDelivery = order.fulfillmentType === 'Home Delivery' || order.fulfillmentType === 'Delivery';
  const isCancelled = order.orderStatus === 'Cancelled';
  const nonCancellableStatuses = ['Shipped', 'Out for Delivery', 'Delivered', 'Collected', 'Completed', 'Cancelled', 'Refunded'];
  const canCancel = !nonCancellableStatuses.includes(order.orderStatus);

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Collected':
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
      case 'Packed':
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Cancelled':
      case 'Refunded':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Placed':
      case 'Confirmed':
      default:
        return 'bg-forest-100 text-forest-900 border-forest-300';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/member/orders')}
          className="inline-flex items-center gap-2 text-xs font-bold text-forest-900 hover:text-gold-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-700 border-rose-300 hover:bg-rose-50 font-bold"
              onClick={() => setCancelModalOpen(true)}
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Cancel Order
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="font-semibold"
            onClick={() => setInvoiceModalOpen(true)}
          >
            <Printer className="w-4 h-4 mr-1.5" /> Printable Invoice
          </Button>

          <Button
            variant="gold"
            size="sm"
            className="font-bold text-forest-950"
            onClick={handleBuyAllAgain}
          >
            <RotateCcw className="w-4 h-4 mr-1.5" /> Buy Again
          </Button>
        </div>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-premium">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-cream-200">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-forest-950 tracking-tight">
                Order #{effectiveOrderId}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
              <button
                onClick={handleCopyOrderId}
                className="p-1 text-gray-400 hover:text-forest-950 rounded transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center gap-2">
              <span>Placed on {formatDate(order.createdAt)}</span>
              <span>•</span>
              <span className="font-semibold text-forest-900">{order.fulfillmentType}</span>
              <span>•</span>
              <span>Invoice Ref: {order.invoiceReference || `INV-${effectiveOrderId}`}</span>
            </p>
          </div>

          <div className="text-left lg:text-right">
            <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">Total Paid</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-forest-950">{formatCurrency(order.total)}</span>
            <span className="text-xs text-emerald-700 font-semibold block mt-0.5">
              Paid via {order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Cancellation Notice if Cancelled */}
        {isCancelled && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
              <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>This order was cancelled on {formatDate(order.cancelledAt || order.updatedAt)}</span>
            </div>
            {order.cancellationReason && (
              <p className="text-rose-700 pl-6">
                <strong>Reason:</strong> {order.cancellationReason}
              </p>
            )}
            <p className="text-rose-700 pl-6">
              <strong>Refund Status:</strong> {order.refundStatus === 'refunded' ? 'Refund Processed' : 'Refund Requested / In Progress'}
              {order.refundAmount > 0 && ` (${formatCurrency(order.refundAmount)})`}
            </p>
          </div>
        )}

        {/* Flipkart/Amazon-Style Visual Order Tracking Timeline */}
        <div id="tracking" className="mt-8 pt-6 border-t border-cream-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-forest-900" />
              <h2 className="font-serif font-bold text-base text-forest-950">Visual Tracking Timeline</h2>
            </div>
            {order.estimatedDeliveryDate && !isCancelled && (
              <span className="text-xs text-gray-600 bg-cream-100 px-3 py-1 rounded-full font-semibold border border-cream-300">
                {isHomeDelivery ? 'Est. Delivery:' : 'Est. Ready:'} {formatDate(order.estimatedDeliveryDate)}
              </span>
            )}
          </div>

          {/* Stepper Timeline */}
          {trackingData?.stages && (
            <div className="pt-6 pb-2">
              <div className="relative">
                {/* Horizontal progress bar track on desktop */}
                <div className="hidden md:block absolute top-5 left-8 right-8 h-1 bg-cream-300 -z-0" />

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-2 relative z-10">
                  {trackingData.stages.map((stage, idx) => {
                    const isDone = stage.state === 'completed';
                    const isCurrent = stage.state === 'current';
                    const isUpcoming = stage.state === 'upcoming';
                    const isStageCancelled = stage.state === 'cancelled';

                    return (
                      <div key={idx} className="flex md:flex-col items-start md:items-center gap-3 md:gap-2 text-left md:text-center">
                        {/* Step Circle Indicator */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : isCurrent
                              ? 'bg-gold-500 border-forest-950 text-forest-950 ring-4 ring-gold-200 animate-pulse font-bold'
                              : isStageCancelled
                                ? 'bg-rose-100 border-rose-300 text-rose-500'
                                : 'bg-white border-cream-400 text-gray-400'
                            }`}
                        >
                          {isDone ? (
                            <Check className="w-5 h-5 stroke-[3]" />
                          ) : isStageCancelled ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold leading-tight ${isCurrent
                              ? 'text-forest-950 underline decoration-gold-500 decoration-2'
                              : isDone
                                ? 'text-forest-900'
                                : 'text-gray-400'
                              }`}
                          >
                            {stage.label}
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{stage.desc}</p>
                          {stage.timestamp && (
                            <p className="text-[10px] text-emerald-800 font-semibold mt-1 font-mono">
                              {formatDate(stage.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Shipment / Courier Reference Information if Dispatched */}
          {(order.shipmentReference || order.carrierName) && (
            <div className="mt-4 p-4 rounded-2xl bg-cream-100 border border-cream-300 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-gray-700">Courier / Partner: </span>
                <span className="font-bold text-forest-950">{order.carrierName || 'Express Club Logistics'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Tracking Reference: </span>
                <span className="font-mono font-bold text-forest-950">{order.shipmentReference || order.trackingNumber}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Delivery/Pickup Info & Payment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping / Pickup Destination Card */}
        <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-premium space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-forest-900/10 flex items-center justify-center text-forest-900">
              {isHomeDelivery ? <Truck className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-forest-950">
                {isHomeDelivery ? 'Delivery Address' : 'Pickup Instructions'}
              </h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                {order.fulfillmentType}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-gray-700">
            <p className="font-semibold text-forest-950">
              Customer: <span className="font-normal">{order.customerName}</span>
            </p>
            {order.customerPhone && (
              <p className="font-semibold text-forest-950">
                Contact: <span className="font-normal font-mono">{order.customerPhone}</span>
              </p>
            )}
            <div className="p-3 bg-cream-50 rounded-xl border border-cream-200">
              <span className="font-semibold text-forest-900 block mb-1">
                {isHomeDelivery ? 'Doorstep Destination:' : 'Club Counter Location:'}
              </span>
              <p className="text-gray-600 leading-relaxed">{order.deliveryAddress}</p>
            </div>

            <p className="text-[11px] text-gray-500 pt-1">
              {isHomeDelivery
                ? 'Standard package delivery with OTP verification upon arrival.'
                : 'Please present this Order ID at the Court 1 Pro Shop counter to collect your equipment.'}
            </p>
          </div>
        </div>

        {/* Payment & Invoice Card */}
        <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-premium space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cream-200">
            <div className="w-9 h-9 rounded-xl bg-forest-900/10 flex items-center justify-center text-forest-900">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-forest-950">Payment & Invoice</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                Receipt #{order.invoiceReference || `INV-${effectiveOrderId}`}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-bold text-forest-950">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">Payment Status:</span>
              <span className="font-bold text-emerald-800 uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[10px]">
                {order.paymentStatus || 'PAID'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">Payment Verified At:</span>
              <span className="font-semibold text-gray-800">{formatDate(order.createdAt)}</span>
            </div>

            <div className="pt-2 border-t border-cream-200 flex justify-between items-center text-sm font-bold text-forest-950">
              <span>Amount Paid:</span>
              <span className="text-base text-forest-900 font-extrabold">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Products Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-300 shadow-premium space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-cream-200">
          <div>
            <h3 className="font-serif font-bold text-lg text-forest-950">
              Purchased Items ({order.items?.length || 0})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Genuine KHELORA sports gear</p>
          </div>
        </div>

        <div className="divide-y divide-cream-200">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="text-sm sm:text-base font-bold text-forest-950">
                  {formatCurrency(item.total || item.price * item.quantity)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-semibold text-xs"
                  onClick={() => handleBuyAgain(item)}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Buy Again
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="pt-6 border-t border-cream-200">
          <div className="max-w-xs ml-auto space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-forest-950">{formatCurrency(order.subtotal)}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Member Discount:</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}

            {isHomeDelivery && (
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className={order.deliveryCharge === 0 ? 'font-bold text-emerald-700 uppercase' : 'font-semibold text-forest-950'}>
                  {order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="font-semibold text-forest-950">{formatCurrency(order.tax)}</span>
            </div>

            <div className="border-t border-cream-300 pt-2 flex justify-between text-sm font-extrabold text-forest-950">
              <span>Grand Total:</span>
              <span className="text-base text-forest-900">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Cancellation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order"
      >
        <form onSubmit={handleCancelOrderSubmit} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Important Cancellation Notice</p>
              <p className="mt-0.5 text-amber-800">
                Cancelling this order will restore reserved items to Pro Shop inventory. If you already made a payment, a refund request will be initiated automatically.
              </p>
            </div>
          </div>

          {cancelError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {cancelError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Select Reason for Cancellation <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2 text-xs">
              {[
                'Ordered wrong item or size',
                'Found better price elsewhere',
                'Changed my mind',
                'Delivery taking too long',
                'Incorrect shipping address',
                'Other'
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${cancelReason === reason
                    ? 'bg-cream-100 border-forest-900 font-semibold text-forest-950'
                    : 'border-cream-200 hover:bg-cream-50 text-gray-700'
                    }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="text-forest-900 focus:ring-forest-900"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              rows={2}
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Tell us why you are cancelling..."
              className="w-full text-xs p-2.5 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setCancelModalOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={cancelling}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Invoice Modal */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Tax Invoice"
      >
        <div className="space-y-6 text-xs text-gray-700 p-2">
          {/* Invoice Header */}
          <div className="flex justify-between items-start pb-4 border-b border-cream-300">
            <div>
              <h2 className="font-serif font-bold text-base text-forest-950">KHELORA</h2>
              <p className="text-gray-500">Official Pro Shop & Equipment</p>
              <p className="text-gray-500">KHELORA Arena Complex, 42 Sports Way, Mumbai</p>
              <p className="font-mono text-gray-500">GSTIN: 27AAAAA0000A1Z5</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-forest-950 block">
                {order.invoiceReference || `INV-${effectiveOrderId}`}
              </span>
              <span className="text-gray-500 block">Date: {formatDate(order.createdAt)}</span>
              <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800 inline-block mt-1">
                PAID ({order.paymentMethod})
              </span>
            </div>
          </div>

          {/* Customer / Fulfillment info */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-cream-300">
            <div>
              <span className="font-bold text-forest-950 block mb-1">Billed To:</span>
              <p className="font-semibold">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <span className="font-bold text-forest-950 block mb-1">Fulfillment:</span>
              <p className="font-semibold">{order.fulfillmentType}</p>
              <p>{order.deliveryAddress}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cream-300 font-bold text-forest-950">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {order.items?.map((itm, i) => (
                <tr key={i}>
                  <td className="py-2 font-medium">{itm.name}</td>
                  <td className="py-2 text-center font-mono">{itm.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(itm.price)}</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(itm.total || itm.price * itm.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="pt-3 border-t border-cream-300 space-y-1 text-right">
            <p>Subtotal: <span className="font-semibold">{formatCurrency(order.subtotal)}</span></p>
            {order.discount > 0 && (
              <p className="text-emerald-700">Privilege Discount: -{formatCurrency(order.discount)}</p>
            )}
            <p>Delivery Fee: {order.deliveryCharge === 0 ? 'FREE' : formatCurrency(order.deliveryCharge)}</p>
            <p>GST (5%): {formatCurrency(order.tax)}</p>
            <p className="text-sm font-bold text-forest-950 pt-2 border-t border-cream-200">
              Grand Total: {formatCurrency(order.total)}
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setInvoiceModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1.5" /> Print Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
