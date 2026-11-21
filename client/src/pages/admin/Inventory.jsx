import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Package, AlertTriangle, ArrowUpDown, Plus, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustType, setAdjustType] = useState('Restock'); // Restock, Adjustment, Return
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    Promise.all([
      productService.getProducts({ activeOnly: 'false' }).catch(() => []),
      productService.getMovements().catch(() => [])
    ]).then(([prods, movs]) => {
      setProducts(prods);
      setMovements(movs);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      const deltaQty = adjustType === 'Adjustment' ? Number(quantity) : Math.abs(Number(quantity));
      await productService.adjustStock({
        productId: selectedProduct.id,
        type: adjustType,
        quantity: deltaQty,
        reason: reason || `Manual inventory update (${adjustType})`
      });
      setAdjustModalOpen(false);
      setQuantity('');
      setReason('');
      fetchInventory();
    } catch (err) {
      alert(err.message || 'Error adjusting stock.');
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockItems = products.filter(p => p.stock <= p.minStockAlert);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Stock Levels & Warehouse Movement Ledger</h2>
          <p className="text-xs text-gray-500 mt-0.5">Synchronized inventory for online member orders and front desk counter sales</p>
        </div>

        {lowStockItems.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{lowStockItems.length} Products at or below reorder threshold</span>
          </div>
        )}
      </div>

      {loading ? (
        <Loader message="Auditing inventory levels..." />
      ) : (
        <div className="space-y-8">
          {/* Stock Table */}
          <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
            <div className="p-5 border-b border-cream-200">
              <h3 className="font-serif font-bold text-base text-forest-950">Active Stock Inventory</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">SKU & Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Min Alert Threshold</th>
                    <th className="p-4">Stock Status</th>
                    <th className="p-4 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {products.map((p) => {
                    const isLow = p.stock <= p.minStockAlert;
                    return (
                      <tr key={p.id} className="hover:bg-cream-50">
                        <td className="p-4 font-bold text-forest-950">
                          {p.name}
                          <span className="block text-[10px] text-gray-400 font-mono">{p.sku}</span>
                        </td>
                        <td className="p-4">{p.category}</td>
                        <td className="p-4 text-sm font-bold text-forest-900">{p.stock} units</td>
                        <td className="p-4 text-gray-500">{p.minStockAlert} units</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isLow ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(p);
                              setAdjustType('Restock');
                              setAdjustModalOpen(true);
                            }}
                          >
                            Restock / Adjust
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Movements Log */}
          <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
            <div className="p-5 border-b border-cream-200">
              <h3 className="font-serif font-bold text-base text-forest-950">Recent Stock Movements Log</h3>
              <p className="text-xs text-gray-500 mt-0.5">Audit trail of all online orders, counter sales, restocks and returns</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Product</th>
                    <th className="p-4">Action Type</th>
                    <th className="p-4">Quantity Change</th>
                    <th className="p-4">Previous → New Stock</th>
                    <th className="p-4">Reason / Order</th>
                    <th className="p-4">Logged By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-cream-50">
                      <td className="p-4 text-gray-500">{formatDate(m.timestamp)}</td>
                      <td className="p-4 font-bold text-forest-950">{m.productName}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-200 text-forest-900">
                          {m.type}
                        </span>
                      </td>
                      <td className={`p-4 font-bold ${m.quantity > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="p-4 text-gray-600">{m.previousStock} → {m.newStock}</td>
                      <td className="p-4 text-gray-800">{m.reason}</td>
                      <td className="p-4 text-gray-500">{m.performedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      <Modal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        title="Adjust Inventory Stock"
        subtitle={selectedProduct ? `${selectedProduct.name} (Current: ${selectedProduct.stock} units)` : ''}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Movement Type</label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
            >
              <option value="Restock">Restock (Received Shipment)</option>
              <option value="Adjustment">Manual Stock Count Correction</option>
              <option value="Return">Customer Return</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Quantity ({adjustType === 'Adjustment' ? '+/- quantity' : 'units to add'})
            </label>
            <input
              type="number"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 20"
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason / Supplier Reference</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Wilson distributor invoice #889"
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Commit Stock Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Inventory;
