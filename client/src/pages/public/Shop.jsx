import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { Search, Filter, ShoppingBag, Eye, Truck, Package, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Shop = () => {
  const { addToCart, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Track Order Modal
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  const categories = ['all', 'Rackets', 'Cricket', 'Balls', 'Footwear', 'Apparel', 'Accessories'];

  const fetchProducts = () => {
    setLoading(true);
    productService.getProducts({
      category: selectedCategory,
      search: searchTerm,
      activeOnly: 'true'
    })
      .then((data) => setProducts(data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setTrackingLoading(true);
    setTrackingError('');
    setTrackedOrder(null);

    try {
      const order = await orderService.getOrderById(trackingId.trim());
      setTrackedOrder(order);
    } catch (err) {
      setTrackingError(err.message || 'Order not found. Please verify the Order ID.');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div className="pb-24 space-y-12">
      {/* Header Banner */}
      <section className="bg-forest-950 text-cream-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
                Official Club Pro Shop
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-cream-50">
                Tournament Rackets & High-Performance Gear
              </h1>
              <p className="mt-2 text-sm text-cream-200 max-w-xl">
                Shared inventory across counter & online store. Members receive up to 15% automatic discount on all gear.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outlineGold"
                size="md"
                onClick={() => setTrackModalOpen(true)}
              >
                <Truck className="w-4 h-4 mr-2" /> Track Club Order
              </Button>
              <Button
                variant="gold"
                size="md"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag className="w-4 h-4 mr-2" /> Open Cart
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-cream-300 shadow-premium flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search racket, bat, ball, shoes..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900 focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-forest-900 text-cream-50 font-bold shadow'
                    : 'bg-cream-100 text-gray-700 hover:bg-cream-200'
                }`}
              >
                {cat === 'all' ? 'All Gear' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <Loader message="Loading pro shop equipment..." />
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-cream-300">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-serif text-lg font-bold text-gray-700">No products match your search</p>
            <p className="text-xs text-gray-500 mt-1">Try another category or keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const isLowStock = product.stock <= product.minStockAlert;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl overflow-hidden border border-cream-300 shadow-premium hover:shadow-premium-lg transition-all flex flex-col justify-between group"
                >
                  <div className="relative h-56 bg-cream-100 overflow-hidden">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600';
                      }}
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-950/80 text-gold-400 backdrop-blur-sm border border-gold-500/30">
                        {product.brand}
                      </span>
                      {isLowStock && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow">
                          Only {product.stock} Left
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setDetailModalOpen(true);
                      }}
                      className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-forest-950 shadow-md backdrop-blur-sm transition-all"
                      title="Quick Specs"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{product.category}</span>
                        <span className="font-mono text-[10px]">{product.sku}</span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-forest-950 mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                        {product.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-baseline justify-between mb-4">
                        <div>
                          <span className="text-xl font-bold text-forest-950">
                            {formatCurrency(product.price)}
                          </span>
                          <p className="text-[10px] text-emerald-700 font-semibold">
                            Gold Member: {formatCurrency(product.memberPrice)}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                        </span>
                      </div>

                      <Button
                        variant="gold"
                        size="sm"
                        disabled={product.stock <= 0}
                        onClick={() => addToCart(product, 1)}
                        className="w-full font-bold shadow"
                      >
                        Add To Cart
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedProduct?.name || 'Product Details'}
        subtitle={selectedProduct ? `${selectedProduct.brand} • SKU: ${selectedProduct.sku}` : ''}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="h-64 rounded-xl overflow-hidden bg-cream-100">
              <img
                src={selectedProduct.image || 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600';
                }}
              />
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedProduct.description}</p>
            </div>

            <div className="bg-cream-100 p-4 rounded-xl border border-cream-300 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Standard Price:</span>
                <p className="text-base font-bold text-forest-950">{formatCurrency(selectedProduct.price)}</p>
              </div>
              <div>
                <span className="text-gray-500">Member Exclusive Price:</span>
                <p className="text-base font-bold text-emerald-700">{formatCurrency(selectedProduct.memberPrice)}</p>
              </div>
              <div>
                <span className="text-gray-500">Available Shelf Stock:</span>
                <p className="font-semibold text-gray-900">{selectedProduct.stock} Units</p>
              </div>
              <div>
                <span className="text-gray-500">Pickup Location:</span>
                <p className="font-semibold text-gray-900">Club Pavilion Pro Shop</p>
              </div>
            </div>

            <Button
              variant="gold"
              size="lg"
              className="w-full font-bold shadow-lg"
              onClick={() => {
                addToCart(selectedProduct, 1);
                setDetailModalOpen(false);
              }}
            >
              Add To Cart & Checkout
            </Button>
          </div>
        )}
      </Modal>

      {/* Track Order Modal */}
      <Modal
        isOpen={trackModalOpen}
        onClose={() => {
          setTrackModalOpen(false);
          setTrackedOrder(null);
          setTrackingError('');
        }}
        title="Track Gear Order"
        subtitle="Enter your Order ID (e.g. TCC-20261121-000123) to view status"
      >
        <form onSubmit={handleTrackOrder} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. TCC-20261121-000123"
              className="flex-1 text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
            />
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={trackingLoading}
            >
              Track
            </Button>
          </div>

          {trackingError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{trackingError}</span>
            </div>
          )}

          {trackedOrder && (
            <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-cream-300">
                <span className="font-bold text-forest-950 text-sm">Order #{trackedOrder.id}</span>
                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {trackedOrder.orderStatus}
                </span>
              </div>
              <p><span className="font-bold">Customer:</span> {trackedOrder.customerName}</p>
              <p><span className="font-bold">Fulfillment:</span> {trackedOrder.fulfillmentType} ({trackedOrder.deliveryAddress})</p>
              <p><span className="font-bold">Total Paid:</span> {formatCurrency(trackedOrder.total)} via {trackedOrder.paymentMethod}</p>

              <div className="pt-2 border-t border-cream-300">
                <p className="font-bold mb-1">Items in Package:</p>
                <ul className="space-y-1 text-gray-600">
                  {trackedOrder.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">{formatCurrency(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
};
export default Shop;
