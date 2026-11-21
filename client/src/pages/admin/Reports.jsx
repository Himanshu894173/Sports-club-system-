import React, { useState, useEffect } from 'react';
import { financeService } from '../../services/financeService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Printer, Download, FileText, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    financeService.getTransactions()
      .then((data) => {
        setTransactions(data);
        if (data.length > 0) setSelectedTxn(data[0]);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Invoices & Financial Reports</h2>
          <p className="text-xs text-gray-500 mt-0.5">Generate printable GST-compliant member receipts and fiscal summaries</p>
        </div>

        <Button variant="gold" size="md" className="font-bold" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" /> Print Official Invoice
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading financial documents..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left: Transaction Selector */}
          <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-premium space-y-4">
            <h3 className="font-serif font-bold text-base text-forest-950">Select Invoice to View</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {transactions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTxn(t)}
                  className={`w-full p-3 rounded-xl text-left border transition-all text-xs ${
                    selectedTxn?.id === t.id
                      ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-md font-bold'
                      : 'bg-cream-50 text-gray-800 border-cream-200 hover:bg-cream-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono">{t.invoiceNumber}</span>
                    <span>{formatCurrency(t.amount)}</span>
                  </div>
                  <p className="truncate opacity-80">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Printable Official Invoice View */}
          <div className="lg:col-span-2">
            {selectedTxn && (
              <div
                id="printable-invoice"
                className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-300 shadow-premium space-y-8 print:border-none print:shadow-none print:p-0"
              >
                {/* Invoice Header */}
                <div className="flex justify-between items-start pb-6 border-b-2 border-forest-900">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#193847] border border-[#C3FF01]/40 p-1 flex items-center justify-center">
                      <img src="/logo.svg" alt="KHELORA" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-xl text-forest-950">KHELORA</h2>
                      <p className="text-[10px] uppercase tracking-widest text-gold-600 font-bold">
                        Official Tax Invoice / Receipt
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-gray-500 space-y-0.5">
                    <p className="font-bold text-sm text-forest-950">{selectedTxn.invoiceNumber}</p>
                    <p>Date: {formatDate(selectedTxn.date)}</p>
                    <p>GSTIN: 07AAAAA0000A1Z5</p>
                  </div>
                </div>

                {/* Club & Billed To */}
                <div className="grid grid-cols-2 gap-6 text-xs text-gray-600">
                  <div>
                    <p className="font-bold text-forest-950 uppercase tracking-wider mb-1">Issued By:</p>
                    <p className="font-semibold text-gray-900">KHELORA Sports Arena Sanctuary</p>
                    <p>Estate 14, Royal Greens Blvd, Sector 62</p>
                    <p>Gurgaon, Haryana 122002</p>
                    <p>Phone: +91 (0124) 488-9000</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-forest-950 uppercase tracking-wider mb-1">Transaction Category:</p>
                    <p className="font-semibold text-gray-900">{selectedTxn.category} Operations</p>
                    <p>Payment Channel: {selectedTxn.paymentMethod}</p>
                    <p className="text-emerald-700 font-bold mt-1">Payment Status: Settled & Verified</p>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border border-cream-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-cream-100 text-forest-950 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Description</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Taxable</th>
                        <th className="p-3 text-right">Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-200">
                      <tr>
                        <td className="p-3 font-semibold text-forest-950">{selectedTxn.description}</td>
                        <td className="p-3 text-gray-600">{selectedTxn.category}</td>
                        <td className="p-3 text-right">1</td>
                        <td className="p-3 text-right">{formatCurrency(Math.round(selectedTxn.amount * 0.95))}</td>
                        <td className="p-3 text-right font-bold text-forest-950">{formatCurrency(selectedTxn.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Total Summary */}
                <div className="flex justify-end text-xs">
                  <div className="w-64 space-y-2 bg-cream-50 p-4 rounded-xl border border-cream-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(Math.round(selectedTxn.amount * 0.95))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (5%):</span>
                      <span className="font-semibold">{formatCurrency(Math.round(selectedTxn.amount * 0.05))}</span>
                    </div>
                    <div className="border-t border-cream-300 pt-2 flex justify-between text-base font-bold text-forest-950">
                      <span>Total Paid:</span>
                      <span className="text-forest-900">{formatCurrency(selectedTxn.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer notes */}
                <div className="pt-6 border-t border-cream-300 text-[11px] text-gray-400 text-center space-y-1">
                  <p>This is a computer-generated tax invoice. Thank you for your continued patronage with KHELORA.</p>
                  <p>Inquiries: accounts@khelora.com | Registered Sports Arena</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Reports;
