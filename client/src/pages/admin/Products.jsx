import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { formatCurrency } from '../../utils/formatters';
import { ShoppingBag, Plus, Search, Edit, Trash2, Power, Eye, Package } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Add/Edit Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Rackets',
    brand: 'Wilson',
    sku: '',
    price: '',
    memberPrice: '',
    costPrice: '',
    stock: '',
    minStockAlert: 3,
    image: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['all', 'Rackets', 'Cricket', 'Balls', 'Footwear', 'Apparel', 'Accessories'];

  const fetchProducts = () => {
    setLoading(true);
    productService.getProducts({ search, category: selectedCategory, activeOnly: 'false' })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Rackets',
      brand: 'Wilson',
      sku: `CC-PRD-${Date.now().toString().slice(-4)}`,
      price: '',
      memberPrice: '',
      costPrice: '',
      stock: '10',
      minStockAlert: 3,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      description: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      brand: p.brand,
      sku: p.sku,
      price: p.price,
      memberPrice: p.memberPrice,
      costPrice: p.costPrice || '',
      stock: p.stock,
      minStockAlert: p.minStockAlert,
      image: p.image,
      description: p.description
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
      } else {
        await productService.addProduct(formData);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.message || 'Error saving product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Sports Shop Product Catalogue</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage sports equipment, prices, SKU codes and member tiers</p>
        </div>

        <Button variant="gold" size="md" className="font-bold" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Add New Product
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU, brand..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-forest-900 text-cream-50 font-bold shadow'
                  : 'bg-cream-100 text-gray-700 hover:bg-cream-200'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
        {loading ? (
          <Loader message="Loading pro shop catalogue..." />
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-serif font-bold text-base text-gray-700">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Item & SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Standard Price</th>
                  <th className="p-4">Gold Member Price</th>
                  <th className="p-4">Shelf Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-cream-300 shrink-0" />
                      <div>
                        <p className="font-bold text-sm text-forest-950">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p.sku} • {p.brand}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700">{p.category}</td>
                    <td className="p-4 font-bold text-forest-950">{formatCurrency(p.price)}</td>
                    <td className="p-4 font-bold text-emerald-700">{formatCurrency(p.memberPrice)}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${p.stock <= p.minStockAlert ? 'text-rose-600 font-bold' : 'text-gray-800'}`}>
                        {p.stock} units
                      </span>
                      {p.stock <= p.minStockAlert && (
                        <span className="block text-[10px] text-rose-500 font-bold">Low Stock Alert</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.isActive !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {p.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-forest-900 hover:bg-cream-100"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(p.id)}
                          className={`p-1.5 rounded-lg ${p.isActive !== false ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          title={p.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Pro Shop Product'}
        subtitle="Counter sales and online shop share this inventory directly"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
              >
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Retail Price (₹)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => {
                  const p = e.target.value;
                  setFormData({
                    ...formData,
                    price: p,
                    memberPrice: p ? Math.round(Number(p) * 0.85) : ''
                  });
                }}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Gold Member Price (₹)</label>
              <input
                type="number"
                value={formData.memberPrice}
                onChange={(e) => setFormData({ ...formData, memberPrice: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Stock Count</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              required
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description & Specs</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Products;
