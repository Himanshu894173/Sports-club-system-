import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { memberService } from '../../services/memberService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Award, Shield, CheckCircle2, Clock, Calendar, ArrowUpRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

export const MyMembership = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    memberService.getPlans()
      .then(data => setPlans(data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const currentPlanObj = plans.find(p => p.name.toLowerCase() === (user?.plan || 'gold').toLowerCase());

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif font-bold text-forest-950">Membership Overview</h2>
        <p className="text-xs text-gray-500 mt-1">Review active plan privileges, expiry timeline, and tier benefits.</p>
      </div>

      {loading ? (
        <Loader message="Loading membership details..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Tier Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-cream-300 shadow-premium space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-cream-200 gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-100 text-gold-900 border border-gold-300">
                  Active Enrollment
                </span>
                <h3 className="text-3xl font-serif font-bold text-forest-950 mt-2">
                  {currentPlanObj?.name || user?.plan} Tier
                </h3>
                <p className="text-xs text-gray-500">{currentPlanObj?.tagline}</p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-serif font-bold text-forest-900">
                  {formatCurrency(currentPlanObj?.priceAnnual)}
                </span>
                <span className="text-xs text-gray-500"> / year</span>
              </div>
            </div>

            {/* Privileges List */}
            <div>
              <h4 className="font-serif font-bold text-base text-forest-950 mb-3">Included Benefits & Privileges:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                {currentPlanObj?.features?.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 bg-cream-50 p-3 rounded-xl border border-cream-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expiry Bar */}
            <div className="bg-cream-100 p-4 rounded-2xl border border-cream-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gold-600" />
                <div>
                  <p className="text-xs font-bold text-forest-950">Membership Expiry Date</p>
                  <p className="text-xs text-gray-500">Valid until 15 Jan 2027 (Auto-renewal enabled)</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setUpgradeModalOpen(true)}>
                Change Plan
              </Button>
            </div>
          </div>

          {/* Quick FAQ / Concierge support */}
          <div className="bg-forest-950 text-cream-50 p-6 rounded-3xl border border-gold-500/30 shadow-premium flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-forest-900 border border-gold-500/50 p-1 flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-gold-400" />
              </div>
              <h4 className="font-serif font-bold text-lg text-cream-50 mb-2">Member Concierge</h4>
              <p className="text-xs text-cream-200 leading-relaxed mb-4">
                Need to add family members to a junior plan, arrange guest tournament access, or adjust your billing cycle? Our front desk concierge is at your service.
              </p>
              <div className="p-3 rounded-xl bg-forest-900/80 text-xs text-gold-300 space-y-1">
                <p>📞 Phone: +91 (0124) 488-9000</p>
                <p>✉️ Email: concierge@khelora.com</p>
              </div>
            </div>

            <div className="pt-6 border-t border-forest-900 mt-6">
              <p className="text-[11px] text-gray-400">Club House Sector 62 • Member ID {user?.memberId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade / Change Plan Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade or Switch Membership Tier"
        subtitle="Select a new tier to update your club access"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Choose your preferred plan. Prorated balance from your existing membership will be automatically adjusted:
          </p>
          <div className="space-y-3">
            {plans.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-cream-300 hover:border-gold-500 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-serif font-bold text-sm text-forest-950">{p.name} Tier</h4>
                  <p className="text-xs text-gray-500">{p.courtDiscountPercent}% Court Discount • {p.shopDiscountPercent}% Shop Discount</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-forest-950">{formatCurrency(p.priceAnnual)}</span>
                  <p className="text-[10px] text-gray-400">/ year</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setUpgradeModalOpen(false)}>
              Close
            </Button>
            <Button variant="gold" size="sm" onClick={() => {
              alert('Plan change request submitted to club front desk.');
              setUpgradeModalOpen(false);
            }}>
              Confirm Plan Switch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default MyMembership;
