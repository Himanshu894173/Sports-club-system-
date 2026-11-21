import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DollarSign, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Finance = () => {
  const [transactions, setTransactions] = useState([]);
  const [corporateClients, setCorporateClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Expense Modal
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    category: 'Court Maintenance',
    description: '',
    amount: '',
    paymentMethod: 'Bank Transfer'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchFinance = () => {
    setLoading(true);
    Promise.all([
      financeService.getTransactions({ type: selectedType, category: selectedCategory }).catch(() => []),
      financeService.getCorporateClients().catch(() => [])
    ]).then(([txns, corps]) => {
      setTransactions(txns);
      setCorporateClients(corps);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFinance();
  }, [selectedType, selectedCategory]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await financeService.addExpense(expenseFormData);
      setExpenseModalOpen(false);
      setExpenseFormData({ category: 'Court Maintenance', description: '', amount: '', paymentMethod: 'Bank Transfer' });
      fetchFinance();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netEarnings = totalIncome - totalExpenses;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Financial Ledger & Corporate Accounts</h2>
          <p className="text-xs text-gray-500 mt-0.5">Real-time consolidated payments, operational expenditures, and corporate receivables</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="gold" size="md" className="font-bold" onClick={() => setExpenseModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Record Club Expense
          </Button>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Income Recorded</p>
            <h3 className="text-2xl font-serif font-bold text-emerald-700 mt-1">{formatCurrency(totalIncome)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Club Expenses</p>
            <h3 className="text-2xl font-serif font-bold text-rose-700 mt-1">{formatCurrency(totalExpenses)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Operational Profit</p>
            <h3 className="text-2xl font-serif font-bold text-forest-950 mt-1">{formatCurrency(netEarnings)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader message="Compiling ledger records..." />
      ) : (
        <div className="space-y-8">
          {/* Transactions Table */}
          <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
            <div className="p-5 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-serif font-bold text-base text-forest-950">Income & Expense Transactions Ledger</h3>
              <div className="flex items-center gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-xs p-1.5 border border-cream-300 rounded-lg bg-white font-semibold"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expenses Only</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Reference #</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Transaction Details</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-cream-50">
                      <td className="p-4 font-mono font-bold text-forest-950">{t.invoiceNumber}</td>
                      <td className="p-4">{formatDate(t.date)}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cream-200 text-forest-900">
                          {t.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">{t.description}</td>
                      <td className="p-4">{t.paymentMethod}</td>
                      <td className={`p-4 text-right font-bold text-sm ${t.type === 'income' ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Corporate Clients Section */}
          <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
            <div className="p-5 border-b border-cream-200">
              <h3 className="font-serif font-bold text-base text-forest-950">Corporate Accounts & Outstanding Receivables</h3>
              <p className="text-xs text-gray-500 mt-0.5">Corporate tournament leagues and executive memberships</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Corporate Client</th>
                    <th className="p-4">Contract Package</th>
                    <th className="p-4">Total Contract Value</th>
                    <th className="p-4">Amount Received</th>
                    <th className="p-4">Outstanding Balance</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {corporateClients.map((c) => (
                    <tr key={c.id} className="hover:bg-cream-50">
                      <td className="p-4">
                        <p className="font-bold text-sm text-forest-950">{c.companyName}</p>
                        <p className="text-[11px] text-gray-500">{c.contactPerson} • {c.email}</p>
                      </td>
                      <td className="p-4 font-semibold text-gray-800">{c.plan}</td>
                      <td className="p-4 font-bold text-forest-950">{formatCurrency(c.contractValue)}</td>
                      <td className="p-4 text-emerald-700 font-bold">{formatCurrency(c.paidAmount)}</td>
                      <td className="p-4 font-bold text-rose-700">{formatCurrency(c.outstandingBalance)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      <Modal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        title="Record Operations Expense"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Category</label>
            <select
              value={expenseFormData.category}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
            >
              <option value="Court Maintenance">Court Maintenance & Materials</option>
              <option value="Utilities">Electricity & ArenaVision Lighting</option>
              <option value="Inventory Restock">Pro Shop / Bar Wholesale Restock</option>
              <option value="Staff Payroll">Coaching & Hospitality Wages</option>
              <option value="General Operations">General Grounds Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Expense Description</label>
            <input
              type="text"
              required
              value={expenseFormData.description}
              onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
              placeholder="e.g. Red clay replenishment shipment from supplier"
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                value={expenseFormData.amount}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                placeholder="e.g. 15000"
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Channel</label>
              <select
                value={expenseFormData.paymentMethod}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, paymentMethod: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="Card">Corporate Credit Card</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Petty Cash</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Record Expense in Ledger
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Finance;
