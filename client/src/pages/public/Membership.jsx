import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { memberService } from '../../services/memberService';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, HelpCircle, Shield, Sparkles, Award } from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export const Membership = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('annual'); // annual or monthly

  useEffect(() => {
    memberService.getPlans()
      .then(data => setPlans(data))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-24 space-y-20">
      {/* Header */}
      <section className="bg-forest-950 text-cream-50 py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
            Club Privileges & Tiers
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-cream-50">
            Membership Plans Built for Excellence
          </h1>
          <p className="mt-4 text-base sm:text-lg text-cream-200 max-w-2xl mx-auto leading-relaxed">
            Transparent pricing with zero hidden fees. Enjoy priority court reservations, pro shop savings, and post-match dining privileges.
          </p>

          {/* Billing Switcher */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-forest-900 border border-forest-800">
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-gold-500 text-forest-950 shadow'
                  : 'text-cream-200 hover:text-white'
              }`}
            >
              Annual Membership (Best Value)
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-gold-500 text-forest-950 shadow'
                  : 'text-cream-200 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
          </div>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <Loader message="Loading official club plans..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const isGold = plan.name.toLowerCase() === 'gold';
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                    isGold
                      ? 'bg-forest-950 text-cream-50 border-2 border-gold-500 shadow-premium-lg ring-1 ring-gold-400 relative'
                      : 'bg-white text-gray-900 border border-cream-300 shadow-premium'
                  }`}
                >
                  {isGold && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gold-500 text-forest-950 font-bold text-[10px] uppercase tracking-wider shadow">
                      Premier Championship Tier
                    </div>
                  )}

                  <div>
                    <h3 className={`text-2xl font-serif font-bold ${isGold ? 'text-gold-400' : 'text-forest-950'}`}>
                      {plan.name} Tier
                    </h3>
                    <p className={`text-xs mt-1 ${isGold ? 'text-cream-200' : 'text-gray-500'}`}>
                      {plan.tagline}
                    </p>

                    <div className="mt-6 mb-6">
                      <span className="text-4xl font-serif font-bold">
                        {formatCurrency(price)}
                      </span>
                      <span className={`text-xs ml-2 ${isGold ? 'text-gray-400' : 'text-gray-500'}`}>
                        / {billingCycle === 'annual' ? 'year' : 'month'}
                      </span>
                    </div>

                    <div className={`p-3.5 rounded-xl mb-6 text-xs font-semibold ${isGold ? 'bg-forest-900 text-gold-300' : 'bg-cream-100 text-forest-900'}`}>
                      <p className="flex justify-between mb-1">
                        <span>Court Booking Benefit:</span>
                        <span className="font-bold">
                          {plan.courtDiscountPercent === 100 ? '100% Free (Up to 2 hrs/day)' : `${plan.courtDiscountPercent}% Discount`}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span>Shop & Bar Discount:</span>
                        <span className="font-bold">{plan.shopDiscountPercent}% Off Everything</span>
                      </p>
                    </div>

                    <ul className="space-y-3.5 text-xs">
                      {plan.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isGold ? 'text-gold-400' : 'text-forest-800'}`} />
                          <span className={isGold ? 'text-cream-100' : 'text-gray-600'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t border-cream-200/30">
                    <Link to={`/register?plan=${plan.name}`}>
                      <Button
                        variant={isGold ? 'gold' : 'primary'}
                        className="w-full font-bold shadow-md"
                      >
                        Enroll in {plan.name} Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 text-center mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm">
            <h4 className="font-serif font-bold text-base text-forest-950 mb-1">
              How does court booking work for Gold members?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Gold members receive 100% complimentary booking privileges for up to two 1-hour sessions per day on any tennis court or cricket net during club operational hours (06:00 to 22:00).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm">
            <h4 className="font-serif font-bold text-base text-forest-950 mb-1">
              Can I upgrade or renew my plan later?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Yes. You can manage, renew, or upgrade your membership anytime through the member portal or at the club front desk. Unused plan validity will be prorated seamlessly.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm">
            <h4 className="font-serif font-bold text-base text-forest-950 mb-1">
              Are guests allowed with members?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Gold plans include 4 complimentary guest passes each month. Silver members receive 1 pass per month. Additional walk-in guest fees apply thereafter.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Membership;
