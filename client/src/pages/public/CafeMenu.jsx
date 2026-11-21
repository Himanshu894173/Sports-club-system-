import React, { useState, useEffect, useMemo } from 'react';
import { barService } from '../../services/barService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatTime } from '../../utils/formatters';
import {
  Coffee,
  Utensils,
  Zap,
  Sparkles,
  Heart,
  Clock,
  Flame,
  Award,
  ChevronRight,
  ShieldCheck,
  Check,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const CafeMenu = () => {
  const { user, isAuthenticated } = useAuth();
  const [menu, setMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // all, veg, protein
  const [searchQuery, setSearchQuery] = useState('');

  // Cart / Ordering State
  const [trayItems, setTrayItems] = useState([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState('tbl_1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [memberIdInput, setMemberIdInput] = useState('');
  const [serviceOption, setServiceOption] = useState('table'); // table, courtside, takeaway
  const [courtLocation, setCourtLocation] = useState('Center Court 1');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const categories = [
    { id: 'all', label: 'All Offerings', icon: Utensils },
    { id: 'Smoothies', label: 'Smoothies & Elixirs', icon: Zap },
    { id: 'Coffee', label: 'Artisanal Coffee', icon: Coffee },
    { id: 'Food', label: 'High-Protein Meals', icon: Utensils },
    { id: 'Snacks', label: 'Power Snacks', icon: Sparkles }
  ];

  const ambienceHighlights = [
    {
      title: 'Court-View Veranda',
      subtitle: 'Al-fresco terrace overlooking Center Court 1. Watch tournament rallies over cold-pressed elixirs.',
      image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1000&auto=format&fit=crop&q=80',
      tag: 'Panoramic Court View'
    },
    {
      title: 'Artisanal Barista Bar',
      subtitle: 'Single-origin Arabica roasts from Chikmagalur estates, pulled on dual-boiler Italian espresso machines.',
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80',
      tag: 'Specialty Coffee'
    },
    {
      title: 'Matchday Social Lounge',
      subtitle: 'Craft mocktails, chilled refreshments, and 4K match screenings with fellow club members.',
      image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1000&auto=format&fit=crop&q=80',
      tag: 'Evening Social'
    },
    {
      title: 'Athlete Nutrition Kitchen',
      subtitle: 'Chef-crafted macro bowls, grass-fed whey isolates, and zero-seed-oil preparation for rapid recovery.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80',
      tag: 'Sports Science Macro'
    }
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      barService.getMenu({ category: selectedCategory }),
      barService.getTables().catch(() => [])
    ])
      .then(([menuData, tablesData]) => {
        setMenu(Array.isArray(menuData) ? menuData : []);
        setTables(Array.isArray(tablesData) ? tablesData : []);
      })
      .catch(() => {
        setMenu([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
      setMemberIdInput(user.memberId || '');
    }
  }, [isAuthenticated, user]);

  // Cart Handlers
  const handleAddToTray = (item) => {
    setTrayItems((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        memberPrice: item.memberPrice || Math.round(item.price * 0.85),
        quantity: 1,
        image: item.image,
        category: item.category
      }];
    });
  };

  const handleUpdateTrayQty = (menuItemId, delta) => {
    setTrayItems((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveTrayItem = (menuItemId) => {
    setTrayItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  // Calculations
  const isMemberApplied = Boolean(isAuthenticated || memberIdInput.trim());
  const traySubtotal = trayItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const trayDiscount = isMemberApplied ? Math.round(traySubtotal * 0.15) : 0;
  const trayTaxable = traySubtotal - trayDiscount;
  const trayTax = Math.round(trayTaxable * 0.05); // 5% GST
  const trayTotal = trayTaxable + trayTax;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (trayItems.length === 0) return;
    setSubmitting(true);

    try {
      let resolvedTableName = 'Veranda Table';
      let resolvedTableId = selectedTableId;

      if (serviceOption === 'courtside') {
        resolvedTableId = 'tbl_takeaway';
        resolvedTableName = `Courtside Delivery: ${courtLocation}`;
      } else if (serviceOption === 'takeaway') {
        resolvedTableId = 'tbl_takeaway';
        resolvedTableName = 'Takeaway / Quick Pickup';
      } else {
        const t = tables.find(tbl => tbl.id === selectedTableId);
        if (t) resolvedTableName = t.name;
      }

      const payload = {
        tableId: resolvedTableId,
        items: trayItems.map(i => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          category: i.category,
          notes: serviceOption === 'courtside' ? `Deliver to ${courtLocation}` : ''
        })),
        customerType: isMemberApplied ? 'member' : 'walk-in',
        memberId: memberIdInput.trim() || (user ? user.memberId : null),
        customerName: customerName.trim() || 'Club Guest',
        customerPhone: customerPhone.trim(),
        isTab: true,
        serverName: 'Online Veranda Order'
      };

      const res = await barService.createOrder(payload);
      setOrderSuccess(res.order);
      setTrayItems([]);
    } catch (err) {
      alert(err.message || 'Error sending order to kitchen.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered menu
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchSearch = !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchDiet = true;
      if (dietaryFilter === 'veg') matchDiet = item.isVeg !== false;
      if (dietaryFilter === 'protein') matchDiet = (item.protein && parseInt(item.protein, 10) >= 15);

      return matchSearch && matchDiet;
    });
  }, [menu, searchQuery, dietaryFilter]);

  return (
    <div className="pb-24 space-y-16 bg-[#F1F2F3] min-h-screen">
      {/* 1. HERO SECTION WITH RICH ATMOSPHERE */}
      <section className="relative bg-[#0F161D] text-white py-20 overflow-hidden border-b border-[#193847]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&auto=format&fit=crop&q=80"
            alt="KHELORA Veranda"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F161D] via-[#1E4252]/90 to-[#0F161D]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E4252] border border-[#C3FF01]/40 text-[#C3FF01] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              KHELORA Veranda & Matchday Bar
            </div>

            <h1 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-tight leading-tight">
              Curated Sports Nutrition & Matchday Dining
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              From post-match 30g whey isolate smoothies to stone-ground avocado sourdoughs and single-origin cold brews. Order directly to your veranda table or courtside.
            </p>

            {/* Privilege Badges */}
            <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-200">
              <span className="flex items-center gap-1.5 bg-[#193847]/80 px-3 py-1.5 rounded-lg border border-gray-700">
                <Award className="w-4 h-4 text-[#C3FF01]" />
                15% Privilege for Gold & Silver Members
              </span>
              <span className="flex items-center gap-1.5 bg-[#193847]/80 px-3 py-1.5 rounded-lg border border-gray-700">
                <ShieldCheck className="w-4 h-4 text-[#C3FF01]" />
                100% Organic & Seed-Oil Free Preparation
              </span>
              <span className="flex items-center gap-1.5 bg-[#193847]/80 px-3 py-1.5 rounded-lg border border-gray-700">
                <Clock className="w-4 h-4 text-[#C3FF01]" />
                Kitchen & Bar Open: 06:30 – 22:30 Daily
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE LOUNGE EXPERIENCE (VISUAL AMBIENCE SHOWCASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1E4252]">
            Atmosphere & Dining
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0F161D]">
            The Veranda Experience
          </h2>
          <p className="text-xs sm:text-sm text-[#777F83]">
            Relax, refuel, and socialise in sophisticated open-air spaces designed for athletes and members.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ambienceHighlights.map((item, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden bg-white border border-[#D0D8D8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-forest-950">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0F161D]/80 backdrop-blur-md text-[#C3FF01] border border-[#C3FF01]/30">
                  {item.tag}
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#0F161D] group-hover:text-[#1E4252] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#777F83] mt-1.5 leading-relaxed">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MENU SEARCH & CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="bg-white p-4 rounded-3xl border border-[#D0D8D8] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#777F83] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search protein shakes, cold brew, meals..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D0D8D8] focus:ring-1 focus:ring-[#1E4252] focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1E4252] text-[#C3FF01] shadow-sm'
                      : 'bg-gray-100 text-[#30383D] hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dietary Filter */}
          <div className="flex items-center gap-1 bg-[#F1F2F3] p-1 rounded-xl shrink-0">
            {[
              { id: 'all', label: 'All Diets' },
              { id: 'veg', label: 'Vegetarian' },
              { id: 'protein', label: 'High Protein (15g+)' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDietaryFilter(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  dietaryFilter === d.id
                    ? 'bg-white text-[#1E4252] font-bold shadow-sm'
                    : 'text-[#777F83] hover:text-[#0F161D]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MENU GRID WITH ADD TO TRAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <Loader message="Brewing fresh menu offerings..." />
        ) : filteredMenu.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#D0D8D8] p-8">
            <Utensils className="w-12 h-12 mx-auto text-[#777F83] mb-3 opacity-40" />
            <h3 className="font-serif text-lg font-bold text-[#0F161D]">No items matching your criteria</h3>
            <p className="text-xs text-[#777F83] mt-1">Try clearing your search query or dietary filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenu.map((item) => {
              const memberRate = item.memberPrice || Math.round(item.price * 0.85);
              const inTray = trayItems.find(i => i.menuItemId === item.id);

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#D0D8D8] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative h-52 overflow-hidden bg-forest-950">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                        item.isVeg !== false
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg !== false ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {item.isVeg !== false ? 'Vegetarian' : 'Non-Veg'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/20">
                        {item.category}
                      </span>
                    </div>

                    {(item.protein || item.calories) && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                        {item.protein && (
                          <span className="text-[#C3FF01] font-bold flex items-center gap-0.5">
                            <Zap className="w-3 h-3" /> {item.protein} Pro
                          </span>
                        )}
                        {item.protein && item.calories ? <span>•</span> : null}
                        {item.calories && (
                          <span className="text-gray-200 flex items-center gap-0.5">
                            <Flame className="w-3 h-3 text-amber-400" /> {item.calories} kcal
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-serif font-bold text-lg text-[#0F161D] group-hover:text-[#1E4252] transition-colors leading-snug">
                        {item.name}
                      </h3>

                      <p className="text-xs text-[#777F83] leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {Array.isArray(item.tags) && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-md bg-[#F1F2F3] text-[10px] font-medium text-[#30383D] border border-[#D0D8D8]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Pricing & Add to Table Tray */}
                    <div className="pt-3 border-t border-[#D0D8D8] flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-[#0F161D]">
                            {formatCurrency(item.price)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#27864A] font-bold flex items-center gap-1 mt-0.5">
                          <Award className="w-3 h-3" />
                          Member: {formatCurrency(memberRate)}
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-[#27864A] ml-1">
                            15% OFF
                          </span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddToTray(item)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                          inTray
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#1E4252] text-[#C3FF01] hover:bg-[#193847]'
                        }`}
                      >
                        {inTray ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added ({inTray.quantity})
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Order to Table
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. FLOATING ORDER TRAY BAR (WHEN ITEMS ARE SELECTED) */}
      {trayItems.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 px-4">
          <div className="max-w-2xl mx-auto bg-[#0F161D] text-white p-4 rounded-3xl border border-[#193847] shadow-2xl flex items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1E4252] text-[#C3FF01] flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-white">
                  {trayItems.reduce((acc, i) => acc + i.quantity, 0)} Items Selected
                </p>
                <p className="text-[11px] text-[#C3FF01] font-semibold">
                  Total: {formatCurrency(trayTotal)} {isMemberApplied ? '(15% Member Discount Applied)' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTrayItems([])}
                className="text-xs text-gray-400 hover:text-white px-3 py-2"
              >
                Clear
              </button>
              <button
                onClick={() => setOrderModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#C3FF01] text-[#0F161D] text-xs font-black uppercase tracking-wider hover:bg-lime-400 shadow-md flex items-center gap-1.5"
              >
                Review & Confirm Order →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. VERANDA ORDER CONFIRMATION MODAL */}
      <Modal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        title="Confirm Table & Veranda Order"
        subtitle="Your order will be transmitted directly to the chef & barista"
      >
        {orderSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-[#0F161D]">Order Transmitted to Kitchen!</h3>
              <p className="text-xs text-[#777F83] mt-1">
                KOT Ticket <strong>#{orderSuccess.orderNumber || orderSuccess.id}</strong> has been created.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Delivering to: <strong>{orderSuccess.tableName}</strong> • Tab is open. You may settle anytime before leaving.
              </p>
            </div>

            <Button
              variant="gold"
              size="md"
              className="mt-4 font-bold"
              onClick={() => {
                setOrderSuccess(null);
                setOrderModalOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
            {/* Delivery Destination */}
            <div>
              <label className="block font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
                Service Destination
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'table', label: 'Veranda Table' },
                  { id: 'courtside', label: 'Courtside Delivery' },
                  { id: 'takeaway', label: 'Takeaway / Pickup' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServiceOption(s.id)}
                    className={`py-2 px-2 rounded-xl border text-center font-bold transition-all ${
                      serviceOption === s.id
                        ? 'bg-[#1E4252] text-[#C3FF01] border-[#1E4252]'
                        : 'bg-white border-[#D0D8D8] text-gray-700'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {serviceOption === 'table' && (
              <div>
                <label className="block font-semibold mb-1">Select Your Table</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D0D8D8] bg-white font-medium"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status.toUpperCase()}) — {t.section}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {serviceOption === 'courtside' && (
              <div>
                <label className="block font-semibold mb-1">Select Court for Runner Delivery</label>
                <select
                  value={courtLocation}
                  onChange={(e) => setCourtLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D0D8D8] bg-white font-medium"
                >
                  <option value="Center Court 1">Center Court 1 (Plexicushion Hard)</option>
                  <option value="Clay Court 2">Clay Court 2 (Red Clay)</option>
                  <option value="Hard Court 3">Practice Hard Court 3</option>
                  <option value="Cricket Net 1">Cricket Batting Net 1</option>
                  <option value="Cricket Net 2">Cricket Bowling Machine Net 2</option>
                </select>
              </div>
            )}

            {/* Customer Information */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full p-2 rounded-lg border border-[#D0D8D8]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2 rounded-lg border border-[#D0D8D8]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Member ID (Optional for 15% Discount)</label>
              <input
                type="text"
                value={memberIdInput}
                onChange={(e) => setMemberIdInput(e.target.value)}
                placeholder="e.g. MEM-2026-001"
                className="w-full p-2 rounded-lg border border-[#D0D8D8]"
              />
            </div>

            {/* Selected Items Breakdown */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 max-h-40 overflow-y-auto">
              {trayItems.map((itm) => (
                <div key={itm.menuItemId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{itm.quantity}×</span>
                    <span>{itm.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{formatCurrency(itm.price * itm.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTrayItem(itm.menuItemId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="pt-2 border-t border-gray-200 space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(traySubtotal)}</span>
              </div>
              {trayDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Member Discount (15%):</span>
                  <span>-{formatCurrency(trayDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>GST (5% F&B):</span>
                <span>{formatCurrency(trayTax)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#0F161D] pt-1 border-t border-gray-200">
                <span>Total Amount:</span>
                <span className="text-[#1E4252]">{formatCurrency(trayTotal)}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-gray-200">
              <Button variant="outline" size="md" onClick={() => setOrderModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
                Send to Kitchen (Open Tab)
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CafeMenu;
