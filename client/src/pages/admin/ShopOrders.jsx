import React, { useState, useEffect, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { memberService } from '../../services/memberService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ShoppingBag,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ChevronRight,
  Package,
  RotateCcw,
  XCircle,
  AlertCircle,
  Printer,
  Archive,
  CreditCard,
  DollarSign,
  TrendingUp,
  User,
  ShieldAlert,
  Send,
  Eye
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import SafeImage from '../../components/common/SafeImage';

export const ShopOrders = () => {
  const [orders, setOrders] = useState([]);
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Manage Order Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [carrierName, setCarrierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Cancellation Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Order cancelled by club admin');
  const [cancelling, setCancelling] = useState(false);

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundRef, setRefundRef] = useState('');
  const [refunding, setRefunding] = useState(false);

  // Invoice Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  // Counter Sale Modal
  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [counterQty, setCounterQty] = useState(1);
  const [counterMemberId, setCounterMemberId] = useState('');
  const [counterPayment, setCounterPayment] = useState('UPI');
  const [submittingSale, setSubmittingSale] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    orderService.getOrders({
      status: selectedStatus,
      fulfillmentType: fulfillmentFilter,
      search: searchQuery
    })
      .then((res) => {
        if (res && res.orders) {
          setOrders(res.orders);
          setKpiData(res.kpi);
        } else if (Array.isArray(res)) {
          setOrders(res);
        }
      })
      .catch(() => {
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, fulfillmentFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    productService.getProducts().then(setProducts).catch(() => []);
    memberService.getMembers().then(setMembers).catch(() => []);
  }, []);

  // Update status handler
  const handleAdvanceStatus = async (targetStatus) => {
    if (!selectedOrder) return;
    try {
      setUpdatingStatus(true);
      const res = await orderService.updateOrderStatus(selectedOrder.orderId || selectedOrder.id, {
        status: targetStatus,
        note: statusNote.trim() || `Status updated to ${targetStatus}`,
        carrierName: carrierName.trim() || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
        shipmentReference: trackingNumber.trim() || undefined
      });
      setSelectedOrder(res.order || null);
      setStatusNote('');
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Cancel order handler
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setCancelling(true);
      const res = await orderService.cancelOrder(selectedOrder.orderId || selectedOrder.id, cancelReason);
      setSelectedOrder(res.order || null);
      setCancelModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  // Process refund handler
  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setRefunding(true);
      const res = await orderService.refundOrder(selectedOrder.orderId || selectedOrder.id, {
        refundAmount: Number(refundAmount) || selectedOrder.total,
        refundReference: refundRef.trim() || `REF-${Date.now().toString().slice(-6)}`,
        note: 'Admin verified refund to customer account'
      });
      setSelectedOrder(res.order || null);
      setRefundModalOpen(false);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to process refund.');
    } finally {
      setRefunding(false);
    }
  };

  // Archive order handler
  const handleArchive = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Are you sure you want to archive this order? (Soft delete)')) return;
    try {
      await orderService.archiveOrder(selectedOrder.orderId || selectedOrder.id);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Failed to archive order.');
    }
  };

  // Counter sale submit
  const handleCounterSaleSubmit = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    setSubmittingSale(true);
    try {
      await orderService.createOrder({
        items: [{
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: Number(counterQty),
          subtotal: prod.price * Number(counterQty)
        }],
        fulfillmentType: 'Front Desk Pickup',
        deliveryAddress: 'Club Pro Shop Counter Pickup',
        paymentMethod: counterPayment,
        isCounterSale: true,
        memberId: counterMemberId || null
      });

      setCounterModalOpen(false);
      setCounterQty(1);
      setSelectedProductId('');
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Counter sale failed.');
    } finally {
      setSubmittingSale(false);
    }
  };

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

  // Next step determination logic
  const getNextAction = (order) => {
    if (!order) return null;
    const isHomeDelivery = order.fulfillmentType === 'Home Delivery' || order.fulfillmentType === 'Delivery';
    switch (order.orderStatus) {
      case 'Placed':
      case 'Pending':
        return { target: 'Confirmed', label: 'Verify & Confirm Order' };
      case 'Confirmed':
        return { target: isHomeDelivery ? 'Processing' : 'Preparing', label: 'Start Fulfilling / Retrieve Stock' };
      case 'Processing':
      case 'Preparing':
        return { target: isHomeDelivery ? 'Packed' : 'Ready for Pickup', label: isHomeDelivery ? 'Mark Packed for Courier' : 'Mark Ready at Front Desk' };
      case 'Packed':
        return { target: 'Shipped', label: 'Dispatch / Handover to Courier' };
      case 'Shipped':
        return { target: 'Out for Delivery', label: 'Mark Out for Delivery' };
      case 'Out for Delivery':
        return { target: 'Delivered', label: 'Confirm Delivered to Customer' };
      case 'Ready for Pickup':
        return { target: 'Collected', label: 'Handover & Mark Collected' };
      default:
        return null;
    }
  };

  const nextAction = getNextAction(selectedOrder);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-forest-950">
            Pro Shop Order Management & Logistics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Dispatch online orders, assign courier shipment tracking, conduct front-desk sales, and manage refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="gold"
            size="md"
            className="font-bold text-forest-950 shrink-0"
            onClick={() => setCounterModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" /> Front-Desk Counter POS
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total Orders', value: kpiData?.totalOrders ?? orders.length, icon: ShoppingBag, color: 'text-forest-950', bg: 'bg-cream-100' },
          { label: 'New / Placed', value: kpiData?.placedCount ?? 0, icon: Clock, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'In Processing', value: kpiData?.processingCount ?? 0, icon: Package, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Shipped / In Transit', value: kpiData?.shippedCount ?? 0, icon: Truck, color: 'text-indigo-700', bg: 'bg-indigo-50' },
          { label: 'Delivered / Completed', value: kpiData?.deliveredCount ?? 0, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Shop Revenue', value: formatCurrency(kpiData?.totalRevenue ?? 0), icon: TrendingUp, color: 'text-gold-600', bg: 'bg-forest-950 text-white' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          const isDark = idx === 5;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all shadow-sm ${
                isDark ? 'bg-forest-950 text-cream-50 border-forest-900' : 'bg-white border-cream-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {kpi.label}
                </span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-lg sm:text-xl font-extrabold mt-2 font-mono ${isDark ? 'text-gold-400' : 'text-forest-950'}`}>
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-cream-300 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'placed', label: 'Placed / New' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === tab.id
                  ? 'bg-forest-950 text-cream-50 shadow-sm'
                  : 'bg-cream-100 text-gray-600 hover:bg-cream-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Fulfillment Dropdown */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="text-xs p-2.5 border border-cream-300 rounded-xl bg-white font-semibold text-gray-700"
          >
            <option value="all">All Fulfillment Types</option>
            <option value="Delivery">Home Delivery</option>
            <option value="Pickup">Front Desk Pickup</option>
          </select>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, customer, phone..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-cream-50 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
        {loading ? (
          <Loader message="Loading pro shop orders..." />
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-serif font-bold text-base text-gray-700">No shop orders found</p>
            <p className="text-xs text-gray-500 mt-1">Try modifying your search or status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {orders.map((ord) => {
                  const effectiveId = ord.orderId || ord.id;
                  const isHomeDelivery = ord.fulfillmentType === 'Home Delivery' || ord.fulfillmentType === 'Delivery';

                  return (
                    <tr key={effectiveId} className="hover:bg-cream-50 transition-colors">
                      {/* ID & Date */}
                      <td className="p-4">
                        <p className="font-mono font-bold text-forest-950">#{effectiveId}</p>
                        <p className="text-[10px] text-gray-500">{formatDate(ord.createdAt)}</p>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-forest-950">{ord.customerName}</p>
                          {ord.memberId && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-gold-400 text-forest-950 font-bold uppercase">
                              Member
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500">{ord.customerEmail || ord.customerPhone || 'Walk-in'}</p>
                      </td>

                      {/* Fulfillment */}
                      <td className="p-4">
                        <span className="font-semibold text-forest-900 flex items-center gap-1">
                          {isHomeDelivery ? <Truck className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                          {ord.fulfillmentType}
                        </span>
                        <p className="text-[10px] text-gray-500 truncate max-w-[180px]">{ord.deliveryAddress}</p>
                      </td>

                      {/* Items */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          {ord.items?.map((item, idx) => (
                            <p key={idx} className="text-gray-700 truncate max-w-xs">
                              <span className="font-bold text-forest-900 font-mono">{item.quantity}x</span> {item.name}
                            </p>
                          ))}
                        </div>
                      </td>

                      {/* Total & Payment */}
                      <td className="p-4">
                        <span className="text-sm font-bold text-forest-950">{formatCurrency(ord.total)}</span>
                        <p className="text-[10px] text-emerald-700 font-semibold">{ord.paymentMethod} Paid</p>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(ord.orderStatus)}`}>
                          {ord.orderStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs"
                          onClick={() => {
                            setSelectedOrder(ord);
                            setCarrierName(ord.carrierName || '');
                            setTrackingNumber(ord.shipmentReference || ord.trackingNumber || '');
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Manage
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Management Inspection Drawer / Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Manage Order #${selectedOrder.orderId || selectedOrder.id}`}
        >
          <div className="space-y-6 text-xs text-gray-700">
            {/* Order Quick Summary Header */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(selectedOrder.orderStatus)}`}>
                  {selectedOrder.orderStatus}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Placed on {formatDate(selectedOrder.createdAt)} • {selectedOrder.fulfillmentType}
                </p>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-forest-950">{formatCurrency(selectedOrder.total)}</span>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  Paid via {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </p>
              </div>
            </div>

            {/* Next Milestone Action Button */}
            {nextAction && selectedOrder.orderStatus !== 'Cancelled' && (
              <div className="p-4 rounded-2xl bg-gold-400/20 border border-gold-400/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-forest-950 uppercase tracking-wider text-[11px]">Recommended Next Step</span>
                  <span className="text-gray-500 font-semibold">Target: {nextAction.target}</span>
                </div>

                {/* If next step is Shipped, provide carrier & tracking number inputs */}
                {nextAction.target === 'Shipped' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Courier / Carrier Name</label>
                      <input
                        type="text"
                        value={carrierName}
                        onChange={(e) => setCarrierName(e.target.value)}
                        placeholder="e.g. BlueDart, DTDC, Express"
                        className="w-full text-xs p-2 border border-cream-300 rounded-lg bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Shipment Tracking Ref #</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. BLU-88992211"
                        className="w-full text-xs p-2 border border-cream-300 rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add optional audit note for customer & club records..."
                    className="w-full text-xs p-2 border border-cream-300 rounded-lg bg-white"
                  />
                </div>

                <Button
                  variant="gold"
                  size="md"
                  loading={updatingStatus}
                  className="w-full font-bold text-forest-950 flex items-center justify-center gap-1.5"
                  onClick={() => handleAdvanceStatus(nextAction.target)}
                >
                  <Send className="w-4 h-4" />
                  <span>{nextAction.label}</span>
                </Button>
              </div>
            )}

            {/* Direct Status Override Dropdown */}
            <div>
              <label className="block text-xs font-bold text-forest-950 mb-1">
                Manual Status Override:
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleAdvanceStatus(e.target.value)}
                  className="flex-1 text-xs p-2 border border-cream-300 rounded-xl bg-white font-semibold"
                >
                  <option value="Placed">Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready for Pickup">Ready for Pickup</option>
                  <option value="Collected">Collected</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Audit Status History Timeline */}
            <div>
              <h4 className="font-bold text-forest-950 uppercase tracking-wider text-[11px] mb-2">
                Order Audit Trail & Milestones ({selectedOrder.statusHistory?.length || 0})
              </h4>
              <div className="bg-cream-50 p-3 rounded-2xl border border-cream-200 divide-y divide-cream-200 max-h-48 overflow-y-auto space-y-2">
                {selectedOrder.statusHistory?.map((h, i) => (
                  <div key={i} className="pt-2 first:pt-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-forest-950">{h.status}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{formatDate(h.timestamp)}</span>
                    </div>
                    {h.note && <p className="text-gray-600 mt-0.5">{h.note}</p>}
                    <p className="text-[10px] text-gray-400 mt-0.5">Updated by: {h.updatedBy || 'Staff'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items Table */}
            <div>
              <h4 className="font-bold text-forest-950 uppercase tracking-wider text-[11px] mb-2">
                Ordered Products
              </h4>
              <div className="bg-cream-50 rounded-2xl border border-cream-200 divide-y divide-cream-200 p-3">
                {selectedOrder.items?.map((itm, i) => (
                  <div key={i} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-forest-950">{itm.name}</p>
                      <p className="text-[11px] text-gray-500">Qty: {itm.quantity} × {formatCurrency(itm.price)}</p>
                    </div>
                    <span className="font-bold text-forest-950">
                      {formatCurrency(itm.total || itm.price * itm.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Cancel, Refund, Invoice, Archive */}
            <div className="pt-4 border-t border-cream-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {selectedOrder.orderStatus !== 'Cancelled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-700 border-rose-300 hover:bg-rose-50 font-bold"
                    onClick={() => setCancelModalOpen(true)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel Order
                  </Button>
                )}

                {selectedOrder.refundStatus !== 'refunded' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-800 border-amber-300 hover:bg-amber-50 font-bold"
                    onClick={() => {
                      setRefundAmount(selectedOrder.total.toString());
                      setRefundModalOpen(true);
                    }}
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1" /> Process Refund
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInvoiceModalOpen(true)}
                >
                  <Printer className="w-3.5 h-3.5 mr-1" /> Invoice
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-rose-700"
                  onClick={handleArchive}
                >
                  <Archive className="w-3.5 h-3.5 mr-1" /> Archive
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Staff Cancel Order Modal */}
      {cancelModalOpen && selectedOrder && (
        <Modal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          title={`Cancel Order #${selectedOrder.orderId || selectedOrder.id}`}
        >
          <form onSubmit={handleCancelSubmit} className="space-y-4">
            <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
              Cancelling this order will immediately restore all items back to available inventory and mark the order as Cancelled.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Cancellation</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
                className="w-full text-xs p-2.5 border border-cream-300 rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setCancelModalOpen(false)}>
                Dismiss
              </Button>
              <Button variant="primary" size="md" type="submit" loading={cancelling} className="bg-rose-600 font-bold text-white">
                Confirm Cancellation & Restock
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Process Refund Modal */}
      {refundModalOpen && selectedOrder && (
        <Modal
          isOpen={refundModalOpen}
          onClose={() => setRefundModalOpen(false)}
          title={`Process Refund for Order #${selectedOrder.orderId || selectedOrder.id}`}
        >
          <form onSubmit={handleRefundSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Refund Amount (INR)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                required
                className="w-full text-xs p-2.5 border border-cream-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Bank / Gateway Reference Number</label>
              <input
                type="text"
                value={refundRef}
                onChange={(e) => setRefundRef(e.target.value)}
                placeholder="e.g. REF-UPI-992211"
                required
                className="w-full text-xs p-2.5 border border-cream-300 rounded-xl font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" loading={refunding} className="font-bold">
                Record Refund in Finance Ledger
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Invoice Modal */}
      {invoiceModalOpen && selectedOrder && (
        <Modal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          title="Tax Invoice"
        >
          <div className="space-y-4 text-xs text-gray-700 p-2">
            <div className="flex justify-between items-start pb-4 border-b border-cream-300">
              <div>
                <h3 className="font-serif font-bold text-base text-forest-950">KHELORA</h3>
                <p className="text-gray-500">Pro Shop & Sports Arena</p>
                <p className="text-gray-500 font-mono">GSTIN: 27AAAAA0000A1Z5</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-forest-950 block">
                  {selectedOrder.invoiceReference || `INV-${selectedOrder.orderId || selectedOrder.id}`}
                </span>
                <span className="text-gray-500 block">Date: {formatDate(selectedOrder.createdAt)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-cream-300">
              <div>
                <span className="font-bold text-forest-950 block mb-1">Customer:</span>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="font-bold text-forest-950 block mb-1">Fulfillment:</span>
                <p>{selectedOrder.fulfillmentType}</p>
                <p>{selectedOrder.deliveryAddress}</p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-cream-300 font-bold text-forest-950">
                  <th className="py-1.5">Item</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Price</th>
                  <th className="py-1.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {selectedOrder.items?.map((itm, i) => (
                  <tr key={i}>
                    <td className="py-1.5">{itm.name}</td>
                    <td className="py-1.5 text-center font-mono">{itm.quantity}</td>
                    <td className="py-1.5 text-right">{formatCurrency(itm.price)}</td>
                    <td className="py-1.5 text-right font-semibold">{formatCurrency(itm.total || itm.price * itm.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pt-2 border-t border-cream-300 space-y-1 text-right">
              <p>Subtotal: {formatCurrency(selectedOrder.subtotal)}</p>
              {selectedOrder.discount > 0 && <p className="text-emerald-700">Discount: -{formatCurrency(selectedOrder.discount)}</p>}
              <p>Tax (GST 5%): {formatCurrency(selectedOrder.tax)}</p>
              <p className="text-sm font-bold text-forest-950 pt-1">Total: {formatCurrency(selectedOrder.total)}</p>
            </div>

            <div className="pt-3 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setInvoiceModalOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Front-Desk Immediate Counter Sale Modal */}
      <Modal
        isOpen={counterModalOpen}
        onClose={() => setCounterModalOpen(false)}
        title="Immediate Front-Desk Counter POS"
      >
        <form onSubmit={handleCounterSaleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Equipment</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-xl bg-white"
              required
            >
              <option value="">-- Select Product From Shelf --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatCurrency(p.price)} - Available: {p.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                required
                value={counterQty}
                onChange={(e) => setCounterQty(e.target.value)}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
              <select
                value={counterPayment}
                onChange={(e) => setCounterPayment(e.target.value)}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-xl bg-white font-semibold"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Club Member (Applies Privilege Discount)</label>
            <select
              value={counterMemberId}
              onChange={(e) => setCounterMemberId(e.target.value)}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-xl bg-white"
            >
              <option value="">Walk-in Guest (Standard Price)</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.plan} Plan)</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setCounterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submittingSale} className="font-bold text-forest-950">
              Complete POS Sale & Deduct Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ShopOrders;
