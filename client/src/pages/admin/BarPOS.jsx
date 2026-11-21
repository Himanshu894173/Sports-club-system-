import React, { useState, useEffect, useMemo } from 'react';
import { barService } from '../../services/barService';
import { memberService } from '../../services/memberService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Coffee,
  Utensils,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  User,
  Users,
  Search,
  Filter,
  Split,
  ArrowRightLeft,
  Printer,
  RefreshCw,
  ChefHat,
  Flame,
  Zap,
  DollarSign,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  Package
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const BarPOS = ({ defaultTab = 'pos' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [members, setMembers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // POS State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('tbl_1');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [guestName, setGuestName] = useState('Walk-in Player');
  const [guestPhone, setGuestPhone] = useState('');
  const [serverName, setServerName] = useState('Barista Manish');
  const [itemNotes, setItemNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // KDS State
  const [kdsFilter, setKdsFilter] = useState('active'); // active, pending, preparing, ready, served

  // Modals
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [orderToSettle, setOrderToSettle] = useState(null);
  const [paymentMode, setPaymentMode] = useState('single'); // single, split
  const [singleMethod, setSingleMethod] = useState('UPI');
  const [splitCashAmount, setSplitCashAmount] = useState(0);
  const [splitUpiAmount, setSplitUpiAmount] = useState(0);
  const [splitCardAmount, setSplitCardAmount] = useState(0);

  // Split Bill Modal
  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [orderToSplit, setOrderToSplit] = useState(null);
  const [selectedSplitIndices, setSelectedSplitIndices] = useState([]);

  // Table Transfer Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSourceTable, setTransferSourceTable] = useState(null);
  const [transferTargetId, setTransferTargetId] = useState('');

  // Invoice / Thermal Print Modal
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Menu Management Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    category: 'Smoothies',
    price: '',
    memberPrice: '',
    costPrice: '',
    stock: 50,
    minStockAlert: 10,
    calories: '',
    protein: '',
    prepTime: '5-10 mins',
    isVeg: true,
    isAvailable: true,
    image: '',
    description: '',
    tags: ''
  });

  // Stock Adjustment Modal
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockItem, setStockItem] = useState(null);
  const [stockAdjQty, setStockAdjQty] = useState('');
  const [stockAdjType, setStockAdjType] = useState('Restock');
  const [stockAdjReason, setStockAdjReason] = useState('');

  // Reports State
  const [reportPeriod, setReportPeriod] = useState('today');
  const [reportData, setReportData] = useState(null);

  const categories = ['all', 'Smoothies', 'Coffee', 'Food', 'Snacks'];

  const fetchPOSData = async () => {
    try {
      const [menuData, tablesData, membersData, ordersData] = await Promise.all([
        barService.getMenu().catch(() => []),
        barService.getTables().catch(() => []),
        memberService.getMembers().catch(() => []),
        barService.getOrders({ status: 'all' }).catch(() => [])
      ]);
      setMenu(menuData);
      setTables(tablesData);
      setMembers(membersData);
      setAllOrders(ordersData);
    } catch (err) {
      console.error('Error loading POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (period) => {
    try {
      const data = await barService.getReports({ period });
      setReportData(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchPOSData();
  }, []);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports(reportPeriod);
    }
  }, [activeTab, reportPeriod]);

  // Derived: Open Tabs
  const openTabs = useMemo(() => {
    return allOrders.filter(o => o.status === 'open');
  }, [allOrders]);

  // Derived: KDS Orders
  const kdsOrders = useMemo(() => {
    return allOrders.filter(o => {
      if (o.status === 'cancelled') return false;
      if (kdsFilter === 'active') return o.kitchenStatus !== 'served';
      return o.kitchenStatus === kdsFilter;
    });
  }, [allOrders, kdsFilter]);

  // POS Calculations
  const selectedMember = members.find((m) => m.id === selectedMemberId);
  let discountPercent = 0;
  if (selectedMember && selectedMember.status === 'active') {
    const plan = (selectedMember.plan || '').toLowerCase();
    if (plan === 'gold') discountPercent = 15;
    else if (plan === 'silver') discountPercent = 10;
    else if (plan === 'junior') discountPercent = 10;
    else discountPercent = 5;
  }

  const subtotal = orderItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxable = subtotal - discountAmount;
  const tax = Math.round(taxable * 0.05); // 5% GST F&B
  const finalTotal = taxable + tax;

  // Handlers: Cart
  const handleAddItem = (item) => {
    if (item.trackStock && item.stock <= 0) {
      alert(`'${item.name}' is currently SOLD OUT.`);
      return;
    }
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        if (item.trackStock && existing.quantity >= item.stock) {
          alert(`Cannot add more than ${item.stock} in-stock units.`);
          return prev;
        }
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        category: item.category,
        notes: ''
      }];
    });
  };

  const handleUpdateQty = (menuItemId, delta) => {
    const itemMeta = menu.find(m => m.id === menuItemId);
    setOrderItems((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            if (delta > 0 && itemMeta && itemMeta.trackStock && newQty > itemMeta.stock) {
              alert(`Only ${itemMeta.stock} servings in stock.`);
              return i;
            }
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (menuItemId) => {
    setOrderItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const handleCreateOrder = async (isTab) => {
    if (!orderItems.length) {
      alert('Please add at least one item to the order.');
      return;
    }
    setSubmitting(true);

    try {
      const payload = {
        tableId: selectedTableId,
        items: orderItems,
        customerType: selectedMember ? 'member' : 'walk-in',
        memberId: selectedMember ? selectedMember.id : null,
        customerName: selectedMember ? selectedMember.name : (guestName || 'Guest'),
        customerPhone: selectedMember ? selectedMember.phone : guestPhone,
        isTab,
        paymentMethod: isTab ? null : 'Cash',
        serverName
      };

      const result = await barService.createOrder(payload);
      setOrderItems([]);
      fetchPOSData();

      if (isTab) {
        alert(`Tab opened on ${result.order.tableName}! KOT #${result.order.orderNumber} sent to kitchen.`);
      } else {
        // Prompt for payment receipt
        handleOpenInvoice(result.order.id);
      }
    } catch (err) {
      alert(err.message || 'Error processing order.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers: KDS
  const handleUpdateKitchenStatus = async (orderId, newStatus) => {
    try {
      await barService.updateKitchenStatus(orderId, { kitchenStatus: newStatus });
      fetchPOSData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleItemStatus = async (orderId, itemIndex, currentStatus) => {
    const nextStatus = currentStatus === 'ready' ? 'served' : (currentStatus === 'preparing' ? 'ready' : 'preparing');
    try {
      await barService.updateKitchenStatus(orderId, { itemIndex, itemStatus: nextStatus });
      fetchPOSData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers: Settlement & Split Payments
  const handleOpenSettle = (order) => {
    setOrderToSettle(order);
    setPaymentMode('single');
    setSingleMethod('UPI');
    setSplitCashAmount(Math.round(order.total / 2));
    setSplitUpiAmount(order.total - Math.round(order.total / 2));
    setSplitCardAmount(0);
    setSettleModalOpen(true);
  };

  const handleConfirmSettle = async () => {
    if (!orderToSettle) return;
    setSubmitting(true);

    try {
      let payload = {};
      if (paymentMode === 'split') {
        const cash = Number(splitCashAmount) || 0;
        const upi = Number(splitUpiAmount) || 0;
        const card = Number(splitCardAmount) || 0;
        const sum = cash + upi + card;

        if (Math.abs(sum - orderToSettle.total) > 1) {
          alert(`Split payments sum (₹${sum}) must equal total (₹${orderToSettle.total}).`);
          setSubmitting(false);
          return;
        }

        const payments = [];
        if (cash > 0) payments.push({ method: 'Cash', amount: cash });
        if (upi > 0) payments.push({ method: 'UPI', amount: upi });
        if (card > 0) payments.push({ method: 'Card', amount: card });

        payload = { paymentMethod: 'Split', payments };
      } else {
        payload = { paymentMethod: singleMethod };
      }

      const res = await barService.settleOrder(orderToSettle.id, payload);
      setSettleModalOpen(false);
      fetchPOSData();
      // Show receipt
      handleOpenInvoice(orderToSettle.id);
    } catch (err) {
      alert(err.message || 'Error settling bill.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers: Split Bill
  const handleOpenSplit = (order) => {
    setOrderToSplit(order);
    setSelectedSplitIndices([]);
    setSplitModalOpen(true);
  };

  const handleConfirmSplit = async () => {
    if (!orderToSplit || selectedSplitIndices.length === 0) {
      alert('Please select at least one item to move to the split bill.');
      return;
    }
    setSubmitting(true);
    try {
      await barService.splitOrder(orderToSplit.id, selectedSplitIndices);
      setSplitModalOpen(false);
      setOrderToSplit(null);
      fetchPOSData();
      alert('Bill successfully split into two separate tickets!');
    } catch (err) {
      alert(err.message || 'Error splitting bill.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers: Table Transfer & Release
  const handleOpenTransfer = (table) => {
    setTransferSourceTable(table);
    const firstOther = tables.find(t => t.id !== table.id && t.status === 'available');
    setTransferTargetId(firstOther ? firstOther.id : '');
    setTransferModalOpen(true);
  };

  const handleConfirmTransfer = async () => {
    if (!transferSourceTable || !transferTargetId) return;
    setSubmitting(true);
    try {
      await barService.transferTable(transferSourceTable.id, transferTargetId);
      setTransferModalOpen(false);
      fetchPOSData();
      alert('Table orders transferred successfully!');
    } catch (err) {
      alert(err.message || 'Error transferring table.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReleaseTable = async (tableId) => {
    try {
      await barService.releaseTable(tableId);
      fetchPOSData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateTableStatus = async (tableId, status) => {
    try {
      await barService.updateTableStatus(tableId, status);
      fetchPOSData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers: Cancel Order & Reverse Stock
  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Please enter cancellation / void reason (e.g. Customer cancelled, kitchen error):', 'Customer changed mind');
    if (!reason) return;

    try {
      await barService.cancelOrder(orderId, { reason, refundMethod: 'UPI' });
      fetchPOSData();
      alert('Order cancelled. Stock reversed and refund transaction logged.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers: Printable Invoice
  const handleOpenInvoice = async (orderId) => {
    try {
      const data = await barService.getInvoice(orderId);
      setInvoiceData(data);
      setInvoiceModalOpen(true);
    } catch (err) {
      alert('Failed to retrieve invoice: ' + err.message);
    }
  };

  // Handlers: Menu Add/Edit
  const handleOpenNewItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      category: 'Smoothies',
      price: '',
      memberPrice: '',
      costPrice: '',
      stock: 50,
      minStockAlert: 10,
      calories: '',
      protein: '',
      prepTime: '5-10 mins',
      isVeg: true,
      isAvailable: true,
      image: '',
      description: '',
      tags: ''
    });
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name || '',
      category: item.category || 'Smoothies',
      price: item.price || '',
      memberPrice: item.memberPrice || '',
      costPrice: item.costPrice || '',
      stock: item.stock !== undefined ? item.stock : 50,
      minStockAlert: item.minStockAlert !== undefined ? item.minStockAlert : 10,
      calories: item.calories || '',
      protein: item.protein || '',
      prepTime: item.prepTime || '5-10 mins',
      isVeg: item.isVeg !== false,
      isAvailable: item.isAvailable !== false,
      image: item.image || '',
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : ''
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...itemForm,
        price: Number(itemForm.price),
        memberPrice: itemForm.memberPrice ? Number(itemForm.memberPrice) : Math.round(Number(itemForm.price) * 0.85),
        costPrice: Number(itemForm.costPrice) || 0,
        stock: Number(itemForm.stock),
        minStockAlert: Number(itemForm.minStockAlert),
        calories: Number(itemForm.calories) || 0,
        tags: itemForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingItem) {
        await barService.updateMenuItem(editingItem.id, payload);
      } else {
        await barService.createMenuItem(payload);
      }

      setItemModalOpen(false);
      fetchPOSData();
      alert(`Item '${payload.name}' saved successfully!`);
    } catch (err) {
      alert(err.message || 'Error saving menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId, name) => {
    if (!window.confirm(`Permanently delete '${name}' from menu?`)) return;
    try {
      await barService.deleteMenuItem(itemId);
      fetchPOSData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers: Stock Adjust
  const handleOpenStockModal = (item) => {
    setStockItem(item);
    setStockAdjQty('');
    setStockAdjType('Restock');
    setStockAdjReason('Morning restock delivery');
    setStockModalOpen(true);
  };

  const handleConfirmStockAdj = async () => {
    if (!stockItem || !stockAdjQty) return;
    const qty = stockAdjType === 'Wastage' ? -Math.abs(Number(stockAdjQty)) : Math.abs(Number(stockAdjQty));
    setSubmitting(true);
    try {
      await barService.updateStock(stockItem.id, {
        quantity: qty,
        type: stockAdjType,
        reason: stockAdjReason
      });
      setStockModalOpen(false);
      fetchPOSData();
      alert(`Stock updated for '${stockItem.name}'.`);
    } catch (err) {
      alert(err.message || 'Error adjusting stock.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered menu for POS
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader message="Loading KHELORA Bar & Cafeteria Engine..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER & NAVIGATION TABS */}
      <div className="bg-white p-5 rounded-3xl border border-[#D0D8D8] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E4252] text-[#C3FF01] flex items-center justify-center font-bold">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-[#0F161D]">
                KHELORA Veranda & Lounge Management
              </h2>
              <p className="text-xs text-[#777F83]">
                Touchscreen POS • Kitchen Display System • Floor Plan & Tabs • F&B Inventory
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F1F2F3] rounded-2xl overflow-x-auto border border-[#D0D8D8]">
          {[
            { id: 'pos', label: 'Live POS', icon: DollarSign },
            { id: 'kds', label: `Kitchen KDS (${kdsOrders.length})`, icon: ChefHat },
            { id: 'tables', label: 'Tables Floor', icon: Utensils },
            { id: 'tabs', label: `Open Tabs (${openTabs.length})`, icon: Receipt },
            { id: 'menu', label: 'Menu & Stock', icon: Package },
            { id: 'reports', label: 'Reports', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#1E4252] text-[#C3FF01] shadow-sm'
                    : 'text-[#30383D] hover:bg-white hover:text-[#0F161D]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#C3FF01]' : 'text-[#777F83]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB: LIVE POS TERMINAL */}
      {/* ========================================================= */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Col: Menu Catalog & Touch Grid */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Categories Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#D0D8D8] shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#777F83] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dishes, coffees, smoothies..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D0D8D8] focus:ring-1 focus:ring-[#1E4252] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-[#1E4252] text-[#C3FF01]'
                          : 'bg-[#F1F2F3] text-[#30383D] hover:bg-gray-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Items' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Items Touch Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredMenu.map((item) => {
                const isSoldOut = item.trackStock && item.stock <= 0;
                const isLowStock = item.trackStock && item.stock <= item.minStockAlert && !isSoldOut;

                return (
                  <button
                    key={item.id}
                    disabled={isSoldOut}
                    onClick={() => handleAddItem(item)}
                    className={`p-3 rounded-2xl bg-white border text-left transition-all shadow-sm hover:shadow-md flex flex-col justify-between group relative overflow-hidden ${
                      isSoldOut
                        ? 'opacity-50 border-gray-200 cursor-not-allowed'
                        : 'border-[#D0D8D8] hover:border-[#1E4252]'
                    }`}
                  >
                    <div className="space-y-2 w-full">
                      <div className="relative h-28 rounded-xl overflow-hidden bg-forest-950">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                          }}
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${item.isVeg !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-md">
                            {item.category}
                          </span>
                        </div>

                        {item.trackStock && (
                          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                            isSoldOut
                              ? 'bg-red-900/90 text-red-200'
                              : isLowStock
                              ? 'bg-amber-900/90 text-amber-200'
                              : 'bg-black/60 text-emerald-300'
                          }`}>
                            {isSoldOut ? 'Sold Out' : `${item.stock} left`}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-serif font-bold text-xs text-[#0F161D] group-hover:text-[#1E4252] transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-[#777F83] line-clamp-1 mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#F1F2F3] w-full">
                      <div>
                        <span className="text-xs font-bold text-[#0F161D] block">{formatCurrency(item.price)}</span>
                        <span className="text-[10px] text-[#27864A] font-semibold">
                          Mem: {formatCurrency(item.memberPrice || Math.round(item.price * 0.85))}
                        </span>
                      </div>

                      <span className="w-6 h-6 rounded-lg bg-[#1E4252] text-[#C3FF01] flex items-center justify-center font-bold text-xs group-hover:scale-110 transition-transform">
                        +
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Col: Register & Ticket */}
          <div className="bg-white p-5 rounded-3xl border border-[#D0D8D8] shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#D0D8D8]">
              <h3 className="font-serif font-bold text-base text-[#0F161D] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#1E4252]" /> Active Order Ticket
              </h3>
              {orderItems.length > 0 && (
                <button
                  onClick={() => setOrderItems([])}
                  className="text-xs text-[#D94343] hover:underline font-semibold"
                >
                  Clear Ticket
                </button>
              )}
            </div>

            {/* Table & Customer Setup */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#777F83] uppercase tracking-wider mb-1">
                  Seating Table / Service Area
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D0D8D8] bg-white font-medium focus:ring-1 focus:ring-[#1E4252]"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status.toUpperCase()}) — {t.section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#777F83] uppercase tracking-wider mb-1">
                  Customer / Member Account
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    const m = members.find(mem => mem.id === e.target.value);
                    if (m) setGuestName(m.name);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D0D8D8] bg-white font-medium focus:ring-1 focus:ring-[#1E4252]"
                >
                  <option value="">Non-Member / Walk-In Player</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan?.toUpperCase()} • {m.memberId})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedMemberId && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Guest Name"
                    className="text-xs p-2 rounded-lg border border-[#D0D8D8]"
                  />
                  <input
                    type="text"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="text-xs p-2 rounded-lg border border-[#D0D8D8]"
                  />
                </div>
              )}
            </div>

            {/* Member Privilege Notification */}
            {selectedMember && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>{selectedMember.plan} Privilege:</strong> {discountPercent}% discount applied automatically.
                </span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-[#777F83] text-xs">
                  <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Ticket is empty. Tap items to add.
                </div>
              ) : (
                orderItems.map((itm) => (
                  <div
                    key={itm.menuItemId}
                    className="p-2.5 rounded-xl bg-[#F1F2F3] border border-[#D0D8D8] flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#0F161D] truncate">{itm.name}</p>
                      <p className="text-[10px] text-[#777F83]">
                        {formatCurrency(itm.price)} × {itm.quantity} = {formatCurrency(itm.price * itm.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(itm.menuItemId, -1)}
                        className="w-6 h-6 rounded bg-white border border-[#D0D8D8] flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="font-bold px-1.5">{itm.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(itm.menuItemId, 1)}
                        className="w-6 h-6 rounded bg-white border border-[#D0D8D8] flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(itm.menuItemId)}
                        className="text-[#D94343] p-1 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bill Summary */}
            <div className="pt-3 border-t border-[#D0D8D8] space-y-1.5 text-xs text-[#30383D]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#27864A] font-semibold">
                  <span>Member Discount ({discountPercent}%):</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5% F&B):</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#0F161D] pt-2 border-t border-[#D0D8D8]">
                <span>Total Amount:</span>
                <span className="text-[#1E4252]">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* POS Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                disabled={orderItems.length === 0 || submitting}
                onClick={() => handleCreateOrder(true)}
                className="w-full text-xs font-bold"
              >
                Open Table Tab
              </Button>

              <Button
                variant="gold"
                size="md"
                disabled={orderItems.length === 0 || submitting}
                onClick={() => handleCreateOrder(false)}
                className="w-full text-xs font-black shadow-md bg-[#1E4252] text-[#C3FF01] hover:bg-[#193847]"
              >
                Pay & Settle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. TAB: KITCHEN DISPLAY SYSTEM (KDS / KOT) */}
      {/* ========================================================= */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          {/* KDS Header & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#D0D8D8]">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-[#1E4252]" />
              <span className="font-serif font-bold text-base text-[#0F161D]">Live Kitchen Order Tickets</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'active', label: 'Active (Cooking)' },
                { id: 'pending', label: 'New Tickets' },
                { id: 'preparing', label: 'Preparing' },
                { id: 'ready', label: 'Ready for Service' },
                { id: 'served', label: 'Completed' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setKdsFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    kdsFilter === f.id
                      ? 'bg-[#1E4252] text-[#C3FF01]'
                      : 'bg-[#F1F2F3] text-[#30383D] hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* KDS Ticket Cards Grid */}
          {kdsOrders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#D0D8D8] p-8">
              <ChefHat className="w-12 h-12 mx-auto text-[#777F83] mb-3 opacity-40" />
              <h3 className="font-serif font-bold text-lg text-[#0F161D]">All Kitchen Tickets Clear</h3>
              <p className="text-xs text-[#777F83] mt-1">No orders pending preparation in the kitchen queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kdsOrders.map((ord) => {
                const isNew = ord.kitchenStatus === 'pending';
                const isPrep = ord.kitchenStatus === 'preparing';
                const isReady = ord.kitchenStatus === 'ready';

                return (
                  <div
                    key={ord.id}
                    className={`rounded-2xl p-4 border flex flex-col justify-between transition-all shadow-sm ${
                      isNew
                        ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400'
                        : isReady
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-white border-[#D0D8D8]'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Ticket Header */}
                      <div className="flex items-center justify-between border-b pb-2 border-gray-200">
                        <div>
                          <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-[#1E4252] text-white">
                            {ord.orderNumber || ord.id.slice(-6)}
                          </span>
                          <span className="ml-2 font-bold text-xs text-[#0F161D]">{ord.tableName}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isNew
                            ? 'bg-amber-200 text-amber-900'
                            : isReady
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {ord.kitchenStatus}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#777F83]">
                        <span>Guest: <strong>{ord.customerName}</strong></span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(ord.createdAt)}
                        </span>
                      </div>

                      {/* Items Checklist */}
                      <div className="space-y-1.5 pt-1">
                        {ord.items.map((itm, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleToggleItemStatus(ord.id, idx, itm.itemStatus || ord.kitchenStatus)}
                            className="p-2 rounded-lg bg-white/80 border border-gray-200 flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                itm.itemStatus === 'served'
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : itm.itemStatus === 'ready'
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-gray-400'
                              }`}>
                                {(itm.itemStatus === 'ready' || itm.itemStatus === 'served') && <Check className="w-2.5 h-2.5" />}
                              </span>
                              <span className="font-bold text-[#0F161D]">{itm.quantity}×</span>
                              <span className={itm.itemStatus === 'served' ? 'line-through text-gray-400' : 'text-[#30383D]'}>
                                {itm.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-gray-500 uppercase">
                              {itm.itemStatus || 'new'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KDS Action Buttons */}
                    <div className="pt-3 mt-3 border-t border-gray-200 flex gap-2">
                      {isNew && (
                        <button
                          onClick={() => handleUpdateKitchenStatus(ord.id, 'preparing')}
                          className="flex-1 py-1.5 rounded-lg bg-[#1E4252] text-white text-xs font-bold hover:bg-[#193847]"
                        >
                          Start Cooking
                        </button>
                      )}
                      {(isNew || isPrep) && (
                        <button
                          onClick={() => handleUpdateKitchenStatus(ord.id, 'ready')}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                        >
                          Mark Ready
                        </button>
                      )}
                      {isReady && (
                        <button
                          onClick={() => handleUpdateKitchenStatus(ord.id, 'served')}
                          className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                        >
                          Mark Served
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TAB: TABLES & FLOOR PLAN */}
      {/* ========================================================= */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#D0D8D8]">
            <h3 className="font-serif font-bold text-base text-[#0F161D]">
              Clubhouse Veranda & Terrace Floor Map
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Occupied
              </span>
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Reserved
              </span>
              <span className="flex items-center gap-1.5 text-yellow-700">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Cleaning
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((t) => {
              const activeOrder = openTabs.find(o => o.tableId === t.id);
              const isOccupied = t.status === 'occupied' || !!activeOrder;
              const isCleaning = t.status === 'cleaning';
              const isReserved = t.status === 'reserved';

              return (
                <div
                  key={t.id}
                  className={`rounded-2xl p-4 border flex flex-col justify-between transition-all shadow-sm ${
                    isOccupied
                      ? 'bg-amber-50/70 border-amber-300'
                      : isCleaning
                      ? 'bg-yellow-50/70 border-yellow-300'
                      : isReserved
                      ? 'bg-blue-50/70 border-blue-300'
                      : 'bg-white border-[#D0D8D8]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#777F83] block">
                          {t.section}
                        </span>
                        <h4 className="font-serif font-bold text-base text-[#0F161D] mt-0.5">{t.name}</h4>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isOccupied
                          ? 'bg-amber-200 text-amber-900'
                          : isCleaning
                          ? 'bg-yellow-200 text-yellow-900'
                          : isReserved
                          ? 'bg-blue-200 text-blue-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">Capacity: {t.capacity} Guests</p>

                    {activeOrder && (
                      <div className="mt-3 p-2.5 rounded-xl bg-white border border-amber-200 text-xs space-y-1">
                        <p className="font-bold text-[#0F161D]">{activeOrder.customerName}</p>
                        <p className="text-[11px] text-gray-600">{activeOrder.items.length} item(s) on tab</p>
                        <p className="text-xs font-bold text-[#1E4252]">{formatCurrency(activeOrder.total)}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200 flex flex-wrap gap-1.5">
                    {isOccupied && activeOrder ? (
                      <>
                        <button
                          onClick={() => handleOpenTransfer(t)}
                          className="flex-1 py-1 px-2 rounded-lg bg-white border border-[#D0D8D8] text-[11px] font-bold text-[#30383D] hover:bg-gray-100 flex items-center justify-center gap-1"
                        >
                          <ArrowRightLeft className="w-3 h-3" /> Move
                        </button>
                        <button
                          onClick={() => handleOpenSettle(activeOrder)}
                          className="flex-1 py-1 px-2 rounded-lg bg-[#1E4252] text-white text-[11px] font-bold hover:bg-[#193847]"
                        >
                          Settle Tab
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTableId(t.id);
                            setActiveTab('pos');
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-[#1E4252] text-[#C3FF01] text-xs font-bold hover:bg-[#193847]"
                        >
                          Seat & Order
                        </button>
                        <button
                          onClick={() => handleReleaseTable(t.id)}
                          className="py-1 px-2.5 rounded-lg bg-white border border-[#D0D8D8] text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                          Clean
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TAB: OPEN TABS & BILL SPLITTING */}
      {/* ========================================================= */}
      {activeTab === 'tabs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#D0D8D8]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#0F161D]">
                Active Customer Tabs ({openTabs.length})
              </h3>
              <p className="text-xs text-[#777F83]">Unpaid open balances awaiting settlement or additional orders</p>
            </div>
            <span className="text-sm font-bold text-[#1E4252]">
              Outstanding Total: {formatCurrency(openTabs.reduce((sum, o) => sum + o.total, 0))}
            </span>
          </div>

          {openTabs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#D0D8D8] p-8">
              <Receipt className="w-12 h-12 mx-auto text-[#777F83] mb-3 opacity-40" />
              <h3 className="font-serif font-bold text-lg text-[#0F161D]">No Open Customer Tabs</h3>
              <p className="text-xs text-[#777F83] mt-1">All veranda & bar orders have been settled.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {openTabs.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl p-5 border border-[#D0D8D8] shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-[#1E4252] text-white">
                        {ord.id}
                      </span>
                      <span className="text-xs font-bold text-[#0F161D]">{ord.tableName}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-sm text-[#0F161D]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#777F83]">
                          Opened {formatTime(ord.createdAt)} • KOT #{ord.orderNumber}
                        </p>
                      </div>
                      <span className="text-base font-bold text-[#1E4252]">{formatCurrency(ord.total)}</span>
                    </div>

                    {/* Items on Tab */}
                    <div className="space-y-1 pt-2 border-t border-gray-100">
                      {ord.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-700">
                          <span>{i.quantity}× {i.name}</span>
                          <span>{formatCurrency(i.price * i.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tab Actions */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleOpenSplit(ord)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-gray-100 text-xs font-bold text-[#30383D] hover:bg-gray-200 flex items-center justify-center gap-1.5"
                    >
                      <Split className="w-3.5 h-3.5" /> Split Bill
                    </button>
                    <button
                      onClick={() => handleOpenSettle(ord)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#1E4252] text-[#C3FF01] text-xs font-bold hover:bg-[#193847]"
                    >
                      Settle Tab
                    </button>
                    <button
                      onClick={() => handleCancelOrder(ord.id)}
                      className="py-1.5 px-3 rounded-xl border border-red-200 text-xs font-semibold text-[#D94343] hover:bg-red-50"
                    >
                      Void / Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. TAB: MENU & INVENTORY MANAGEMENT */}
      {/* ========================================================= */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#D0D8D8]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#0F161D]">
                Food & Beverage Menu Master ({menu.length} Offerings)
              </h3>
              <p className="text-xs text-[#777F83]">Configure recipes, pricing, stock tracking, and nutritional macros</p>
            </div>
            <Button variant="gold" size="sm" onClick={handleOpenNewItem} className="font-bold">
              <Plus className="w-4 h-4 mr-1.5" /> Add New Item
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-[#D0D8D8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F2F3] border-b border-[#D0D8D8] text-[#777F83] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Offering</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Price</th>
                    <th className="p-3.5">Member Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D0D8D8]">
                  {menu.map((itm) => (
                    <tr key={itm.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={itm.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                            alt={itm.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0 bg-forest-950"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100';
                            }}
                          />
                          <div>
                            <span className="font-bold text-[#0F161D] block">{itm.name}</span>
                            <span className="text-[11px] text-gray-500">{itm.protein ? `${itm.protein} Pro • ` : ''}{itm.calories ? `${itm.calories} kcal` : ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-700">{itm.category}</td>
                      <td className="p-3.5 font-bold text-[#0F161D]">{formatCurrency(itm.price)}</td>
                      <td className="p-3.5 font-bold text-[#27864A]">
                        {formatCurrency(itm.memberPrice || Math.round(itm.price * 0.85))}
                      </td>
                      <td className="p-3.5">
                        <span className={`font-bold px-2 py-0.5 rounded-full ${
                          itm.stock <= itm.minStockAlert ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {itm.stock} units
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          itm.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {itm.isAvailable ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenStockModal(itm)}
                          className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold"
                        >
                          Stock
                        </button>
                        <button
                          onClick={() => handleOpenEditItem(itm)}
                          className="px-2.5 py-1 rounded bg-[#1E4252] hover:bg-[#193847] text-[#C3FF01] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(itm.id, itm.name)}
                          className="px-2.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. TAB: SALES & INVENTORY REPORTS */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#D0D8D8]">
            <h3 className="font-serif font-bold text-base text-[#0F161D]">
              Cafeteria Financial & Inventory Analytics
            </h3>

            <div className="flex items-center gap-1.5">
              {['today', 'week', 'month', 'all'].map((p) => (
                <button
                  key={p}
                  onClick={() => setReportPeriod(p)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    reportPeriod === p
                      ? 'bg-[#1E4252] text-[#C3FF01]'
                      : 'bg-[#F1F2F3] text-[#30383D] hover:bg-gray-200'
                  }`}
                >
                  {p === 'today' ? 'Today' : p === 'week' ? 'Last 7 Days' : p === 'month' ? 'This Month' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {reportData && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#D0D8D8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#777F83] uppercase tracking-wider">Collected F&B Revenue</p>
                  <p className="text-2xl font-black text-[#1E4252] mt-1">{formatCurrency(reportData.totalRevenue)}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{reportData.ordersCount} settled bills</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D0D8D8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#777F83] uppercase tracking-wider">Outstanding Open Tabs</p>
                  <p className="text-2xl font-black text-amber-700 mt-1">{formatCurrency(reportData.outstandingTabBalance)}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{reportData.openTabsCount} active tables</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D0D8D8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#777F83] uppercase tracking-wider">Discounts Granted</p>
                  <p className="text-2xl font-black text-[#27864A] mt-1">{formatCurrency(reportData.totalDiscounts)}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Gold/Silver member privileges</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D0D8D8] shadow-sm">
                  <p className="text-[11px] font-bold text-[#777F83] uppercase tracking-wider">Void / Cancelled</p>
                  <p className="text-2xl font-black text-[#D94343] mt-1">{reportData.cancelledCount}</p>
                  <p className="text-[11px] text-gray-500 mt-1">Stock reversed automatically</p>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular Items */}
                <div className="bg-white p-5 rounded-2xl border border-[#D0D8D8] shadow-sm space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#0F161D]">Top Selling Menu Offerings</h4>
                  <div className="space-y-2">
                    {reportData.popularItems.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50">
                        <span className="font-medium text-gray-800">{p.name}</span>
                        <span className="font-bold text-[#1E4252]">{p.quantity} orders</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tender Breakdown */}
                <div className="bg-white p-5 rounded-2xl border border-[#D0D8D8] shadow-sm space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#0F161D]">Payment Methods Collected</h4>
                  <div className="space-y-2">
                    {reportData.paymentBreakdown.map((pm, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-gray-50">
                        <span className="font-medium text-gray-800">{pm.method}</span>
                        <span className="font-bold text-[#0F161D]">{formatCurrency(pm.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-5 rounded-2xl border border-[#D0D8D8] shadow-sm space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#0F161D] text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" /> Low Stock Inventory Alerts
                  </h4>
                  {reportData.lowStockItems.length === 0 ? (
                    <p className="text-xs text-gray-500 py-4">All menu stocks above minimum threshold.</p>
                  ) : (
                    <div className="space-y-2">
                      {reportData.lowStockItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs p-2 rounded-lg bg-red-50 text-red-900 border border-red-200">
                          <div>
                            <span className="font-bold block">{item.name}</span>
                            <span className="text-[10px] text-red-700">{item.stock} left (Min: {item.minStockAlert})</span>
                          </div>
                          <button
                            onClick={() => handleOpenStockModal(item)}
                            className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold"
                          >
                            Restock
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SETTLE & SPLIT PAYMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        title="Settle Order & Bill"
        subtitle={orderToSettle ? `Order #${orderToSettle.id} • ${orderToSettle.tableName} (${orderToSettle.customerName})` : ''}
      >
        {orderToSettle && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#F1F2F3] border border-[#D0D8D8] text-center">
              <span className="text-xs text-[#777F83] font-bold uppercase tracking-wider block">Total Payable</span>
              <span className="text-3xl font-black text-[#1E4252] mt-1 block">
                {formatCurrency(orderToSettle.total)}
              </span>
            </div>

            {/* Tender Type Selection */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMode('single')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  paymentMode === 'single' ? 'bg-[#1E4252] text-[#C3FF01]' : 'text-gray-700'
                }`}
              >
                Single Payment
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('split')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  paymentMode === 'split' ? 'bg-[#1E4252] text-[#C3FF01]' : 'text-gray-700'
                }`}
              >
                Split Tender (Cash + UPI)
              </button>
            </div>

            {paymentMode === 'single' ? (
              <div className="grid grid-cols-3 gap-2 pt-2">
                {['UPI', 'Cash', 'Card'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSingleMethod(m)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                      singleMethod === m
                        ? 'bg-[#1E4252] text-[#C3FF01] border-[#1E4252]'
                        : 'bg-white border-[#D0D8D8] text-[#30383D]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2 pt-2 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Cash Tender (₹)</label>
                  <input
                    type="number"
                    value={splitCashAmount}
                    onChange={(e) => setSplitCashAmount(e.target.value)}
                    className="w-full p-2 border border-[#D0D8D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">UPI Tender (₹)</label>
                  <input
                    type="number"
                    value={splitUpiAmount}
                    onChange={(e) => setSplitUpiAmount(e.target.value)}
                    className="w-full p-2 border border-[#D0D8D8] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Card Tender (₹)</label>
                  <input
                    type="number"
                    value={splitCardAmount}
                    onChange={(e) => setSplitCardAmount(e.target.value)}
                    className="w-full p-2 border border-[#D0D8D8] rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-2 border-t border-gray-200">
              <Button variant="outline" size="md" onClick={() => setSettleModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                size="md"
                loading={submitting}
                onClick={handleConfirmSettle}
                className="font-bold"
              >
                Confirm Settlement & Print
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: SPLIT BILL ITEMS */}
      {/* ========================================================= */}
      <Modal
        isOpen={splitModalOpen}
        onClose={() => setSplitModalOpen(false)}
        title="Split Order Ticket"
        subtitle={orderToSplit ? `Select items to detach into Ticket B` : ''}
      >
        {orderToSplit && (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Check the dishes or beverages you want to branch off into a separate ticket for individual payment:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orderToSplit.items.map((itm, idx) => (
                <label
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                    selectedSplitIndices.includes(idx) ? 'bg-amber-50 border-amber-300' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedSplitIndices.includes(idx)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSplitIndices(prev => [...prev, idx]);
                        } else {
                          setSelectedSplitIndices(prev => prev.filter(i => i !== idx));
                        }
                      }}
                      className="rounded text-[#1E4252]"
                    />
                    <span className="font-bold">{itm.quantity}× {itm.name}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(itm.price * itm.quantity)}</span>
                </label>
              ))}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-200">
              <Button variant="outline" size="md" onClick={() => setSplitModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                size="md"
                loading={submitting}
                onClick={handleConfirmSplit}
                disabled={selectedSplitIndices.length === 0}
                className="font-bold"
              >
                Create Split Bill
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: TRANSFER TABLE */}
      {/* ========================================================= */}
      <Modal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Table Orders"
        subtitle={transferSourceTable ? `Move active tab from ${transferSourceTable.name}` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Destination Table</label>
            <select
              value={transferTargetId}
              onChange={(e) => setTransferTargetId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#D0D8D8] text-xs font-medium"
            >
              <option value="">Choose Available Table</option>
              {tables
                .filter(t => !transferSourceTable || t.id !== transferSourceTable.id)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status.toUpperCase()}) — {t.section}
                  </option>
                ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-gray-200">
            <Button variant="outline" size="md" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gold"
              size="md"
              loading={submitting}
              onClick={handleConfirmTransfer}
              disabled={!transferTargetId}
              className="font-bold"
            >
              Transfer Tab
            </Button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: PRINTABLE THERMAL TAX INVOICE */}
      {/* ========================================================= */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Official Tax Invoice & Receipt"
        subtitle={invoiceData?.order ? `Invoice #${invoiceData.order.invoiceId || invoiceData.order.id}` : ''}
      >
        {invoiceData && (
          <div className="space-y-4">
            <div id="printable-receipt" className="p-6 rounded-2xl bg-white border border-gray-300 font-mono text-xs text-gray-800 space-y-3 shadow-inner">
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
                <h3 className="font-bold text-base uppercase tracking-tight">{invoiceData.clubName}</h3>
                <p className="text-[10px] text-gray-600">{invoiceData.address}</p>
                <p className="text-[10px] text-gray-600">GSTIN: {invoiceData.gstin} • FSSAI: {invoiceData.fssai}</p>
                <p className="text-[10px] text-gray-600">Phone: {invoiceData.phone}</p>
              </div>

              <div className="flex justify-between text-[11px] pb-2 border-b border-gray-200">
                <div>
                  <p><strong>Table:</strong> {invoiceData.order.tableName}</p>
                  <p><strong>Customer:</strong> {invoiceData.order.customerName}</p>
                  <p><strong>Server:</strong> {invoiceData.order.serverName || 'Staff'}</p>
                </div>
                <div className="text-right">
                  <p><strong>Date:</strong> {formatDate(invoiceData.order.createdAt)}</p>
                  <p><strong>Time:</strong> {formatTime(invoiceData.order.createdAt)}</p>
                  <p><strong>Bill ID:</strong> #{invoiceData.order.id.slice(-6)}</p>
                </div>
              </div>

              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-dashed border-gray-400">
                  <tr>
                    <th className="py-1">Item</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Amt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoiceData.order.items.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{i.name}</td>
                      <td className="py-1 text-center">{i.quantity}</td>
                      <td className="py-1 text-right">{formatCurrency(i.price)}</td>
                      <td className="py-1 text-right">{formatCurrency(i.price * i.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-2 border-t border-dashed border-gray-400 space-y-1 text-right text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoiceData.order.subtotal)}</span>
                </div>
                {invoiceData.order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Member Discount ({invoiceData.order.discountPercent || 15}%):</span>
                    <span>-{formatCurrency(invoiceData.order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST (2.5%):</span>
                  <span>{formatCurrency(Math.round(invoiceData.order.tax / 2))}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST (2.5%):</span>
                  <span>{formatCurrency(Math.round(invoiceData.order.tax / 2))}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-black pt-1 border-t border-gray-300">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(invoiceData.order.total)}</span>
                </div>
                <p className="text-[10px] text-gray-500 pt-1">
                  Paid via: <strong>{invoiceData.order.paymentMethod || 'UPI'}</strong> • Status: PAID
                </p>
              </div>

              <div className="text-center pt-2 text-[10px] text-gray-500 border-t border-dashed border-gray-300">
                Thank you for dining at KHELORA Veranda & Lounge!
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="md" onClick={() => setInvoiceModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="gold"
                size="md"
                onClick={() => window.print()}
                className="font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Thermal Bill
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: ADD / EDIT MENU ITEM */}
      {/* ========================================================= */}
      <Modal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={editingItem ? `Edit '${editingItem.name}'` : 'Add New Menu Offering'}
        subtitle="Manage dish pricing, ingredients and nutritional macros"
      >
        <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Item Name</label>
            <input
              type="text"
              required
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full p-2 border border-[#D0D8D8] rounded-lg"
              placeholder="e.g. Avocado Toast"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Category</label>
              <select
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="w-full p-2 border border-[#D0D8D8] rounded-lg bg-white"
              >
                <option value="Smoothies">Smoothies</option>
                <option value="Coffee">Coffee</option>
                <option value="Food">Food</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Regular Price (₹)</label>
              <input
                type="number"
                required
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                className="w-full p-2 border border-[#D0D8D8] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Stock Available</label>
              <input
                type="number"
                value={itemForm.stock}
                onChange={(e) => setItemForm({ ...itemForm, stock: e.target.value })}
                className="w-full p-2 border border-[#D0D8D8] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                value={itemForm.minStockAlert}
                onChange={(e) => setItemForm({ ...itemForm, minStockAlert: e.target.value })}
                className="w-full p-2 border border-[#D0D8D8] rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Calories (kcal)</label>
              <input
                type="number"
                value={itemForm.calories}
                onChange={(e) => setItemForm({ ...itemForm, calories: e.target.value })}
                className="w-full p-2 border border-[#D0D8D8] rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Protein (e.g. 30g)</label>
              <input
                type="text"
                value={itemForm.protein}
                onChange={(e) => setItemForm({ ...itemForm, protein: e.target.value })}
                className="w-full p-2 border border-[#D0D8D8] rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Image URL</label>
            <input
              type="text"
              value={itemForm.image}
              onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
              placeholder="Paste image URL (e.g. Unsplash)"
              className="w-full p-2 border border-[#D0D8D8] rounded-lg"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              rows={2}
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="w-full p-2 border border-[#D0D8D8] rounded-lg"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isVeg}
                onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.checked })}
              />
              <span>Vegetarian</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isAvailable}
                onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
              />
              <span>Available for Sale</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-gray-200">
            <Button variant="outline" size="md" onClick={() => setItemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Save Offering
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: STOCK ADJUSTMENT / WASTAGE */}
      {/* ========================================================= */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Adjust Inventory & Stock"
        subtitle={stockItem ? `${stockItem.name} (Current Stock: ${stockItem.stock})` : ''}
      >
        {stockItem && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Adjustment Type</label>
              <select
                value={stockAdjType}
                onChange={(e) => setStockAdjType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#D0D8D8] bg-white font-medium"
              >
                <option value="Restock">Restock (+ Add Stock)</option>
                <option value="Wastage">Wastage / Spoilage (- Deduct Stock)</option>
                <option value="Correction">Inventory Audit Correction</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Quantity</label>
              <input
                type="number"
                required
                value={stockAdjQty}
                onChange={(e) => setStockAdjQty(e.target.value)}
                placeholder="e.g. 25"
                className="w-full p-2.5 rounded-xl border border-[#D0D8D8]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Reason / Notes</label>
              <input
                type="text"
                value={stockAdjReason}
                onChange={(e) => setStockAdjReason(e.target.value)}
                placeholder="e.g. Fresh supplier delivery"
                className="w-full p-2.5 rounded-xl border border-[#D0D8D8]"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-200">
              <Button variant="outline" size="md" onClick={() => setStockModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="gold"
                size="md"
                loading={submitting}
                onClick={handleConfirmStockAdj}
                className="font-bold"
              >
                Update Stock
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BarPOS;
