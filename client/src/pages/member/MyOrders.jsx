import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  ChevronRight,
  Filter,
  XCircle,
  RotateCcw,
  MapPin,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import SafeImage from '../../components/common/SafeImage';
import Modal from '../../components/common/Modal';

export const MyOrders = () => {
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'delivered', 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');

  // Cancellation modal state
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered wrong item or size');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const fetchOrders = () => {
    setLoading(true);
    orderService.getMyOrders()
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;

    try {
      setCancelling(true);
      setCancelError('');
      await orderService.cancelOrder(cancelModalOrder.orderId || cancelModalOrder.id, cancelReason);
      setCancelModalOrder(null);
      fetchOrders();
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

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = (order.orderStatus || '').toLowerCase();

      // Tab filtering
      if (activeTab === 'active') {
        const activeStatuses = ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'preparing', 'ready for pickup', 'pending', 'ready'];
        if (!activeStatuses.includes(status)) return false;
      } else if (activeTab === 'delivered') {
        const deliveredStatuses = ['delivered', 'collected', 'completed'];
        if (!deliveredStatuses.includes(status)) return false;
      } else if (activeTab === 'cancelled') {
        const cancelledStatuses = ['cancelled', 'returned', 'refunded'];
        if (!cancelledStatuses.includes(status)) return false;
      }

      // Search query filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = (order.orderId || order.id || '').toLowerCase().includes(q);
        const matchesItem = (order.items || []).some(
          itm => (itm.name || '').toLowerCase().includes(q) || (itm.brand || '').toLowerCase().includes(q)
        );
        if (!matchesId && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery]);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-forest-950">My Equipment & Pro Shop Orders</h1>
          <p className="text-xs text-gray-500 mt-1">
            Track shipments, inspect order milestones, download invoices, and reorder club equipment.
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          className="font-bold text-forest-950 shrink-0"
          onClick={() => navigate('/shop')}
        >
          <ShoppingBag className="w-4 h-4 mr-1.5" /> Browse Pro Shop
        </Button>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-3xl border border-cream-300 shadow-premium space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              {
                id: 'active',
                label: 'Active & In Transit',
                count: orders.filter(o => ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'out for delivery', 'preparing', 'ready for pickup', 'pending', 'ready'].includes((o.orderStatus || '').toLowerCase())).length
              },
              {
                id: 'delivered',
                label: 'Delivered',
                count: orders.filter(o => ['delivered', 'collected', 'completed'].includes((o.orderStatus || '').toLowerCase())).length
              },
              {
                id: 'cancelled',
                label: 'Cancelled',
                count: orders.filter(o => ['cancelled', 'returned', 'refunded'].includes((o.orderStatus || '').toLowerCase())).length
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-forest-950 text-cream-50 shadow-sm'
                    : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-gold-500 text-forest-950' : 'bg-cream-300 text-gray-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or item..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900 focus:outline-none placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <Loader message="Fetching your orders..." />
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-cream-300 shadow-premium space-y-4">
          <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mx-auto text-gray-400 border border-cream-200">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-bold text-lg text-forest-950">
            {searchQuery ? 'No matching orders found' : 'No orders in this category'}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery
              ? `No orders matching "${searchQuery}". Try searching with a different term.`
              : 'Visit our pro shop to gear up with tour-grade rackets, balls, and apparel.'}
          </p>
          <div className="pt-2">
            <Button variant="gold" onClick={() => navigate('/shop')}>
              Explore Equipment Store
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const effectiveId = order.orderId || order.id;
            const isHomeDelivery = order.fulfillmentType === 'Home Delivery' || order.fulfillmentType === 'Delivery';
            const nonCancellable = ['Shipped', 'Out for Delivery', 'Delivered', 'Collected', 'Completed', 'Cancelled', 'Refunded'];
            const canCancel = !nonCancellable.includes(order.orderStatus);

            return (
              <div
                key={effectiveId}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-premium transition-all hover:border-cream-400 space-y-5"
              >
                {/* Order Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-sm sm:text-base font-bold text-forest-950">
                        #{effectiveId}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-600 bg-cream-100 border border-cream-300 flex items-center gap-1">
                        {isHomeDelivery ? <Truck className="w-3 h-3 text-forest-900" /> : <MapPin className="w-3 h-3 text-forest-900" />}
                        {order.fulfillmentType}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      Ordered on {formatDate(order.createdAt)} • Paid via {order.paymentMethod}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-base sm:text-lg font-extrabold text-forest-950">
                      {formatCurrency(order.total)}
                    </span>
                    <span className="text-[11px] text-gray-500 block">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          category="tennis"
                          className="w-12 h-12 rounded-xl object-cover border border-cream-300 bg-cream-50 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-forest-950 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500">
                            Qty: <strong className="font-mono text-forest-900">{item.quantity}</strong> × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-forest-950">
                          {formatCurrency(item.total || item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    {order.orderStatus === 'Delivered' || order.orderStatus === 'Collected' ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Order Completed & Delivered
                      </span>
                    ) : order.orderStatus === 'Cancelled' ? (
                      <span className="text-rose-700 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Cancelled: {order.cancellationReason || 'Requested by customer'}
                      </span>
                    ) : (
                      <span className="text-forest-900 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {isHomeDelivery ? 'In Processing / Delivery' : 'Preparing at Pro Shop'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-700 border-rose-300 hover:bg-rose-50 text-xs font-semibold"
                        onClick={() => setCancelModalOrder(order)}
                      >
                        Cancel Order
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold"
                      onClick={() => navigate(`/member/orders/${effectiveId}#tracking`)}
                    >
                      <Truck className="w-3.5 h-3.5 mr-1" /> Track
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs font-bold flex items-center gap-1"
                      onClick={() => navigate(`/member/orders/${effectiveId}`)}
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOrder && (
        <Modal
          isOpen={Boolean(cancelModalOrder)}
          onClose={() => setCancelModalOrder(null)}
          title={`Cancel Order #${cancelModalOrder.orderId || cancelModalOrder.id}`}
        >
          <form onSubmit={handleCancelSubmit} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <p>
                Cancelling this order will release the reserved gear back into Pro Shop stock. A full refund of <strong className="font-bold">{formatCurrency(cancelModalOrder.total)}</strong> will be credited to your original payment method ({cancelModalOrder.paymentMethod}).
              </p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {cancelError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900 focus:outline-none"
              >
                <option value="Ordered wrong item or size">Ordered wrong item or size</option>
                <option value="Found better price elsewhere">Found better price elsewhere</option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Delivery taking too long">Delivery taking too long</option>
                <option value="Incorrect delivery address">Incorrect delivery address</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCancelModalOrder(null)}
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
      )}
    </div>
  );
};

export default MyOrders;
