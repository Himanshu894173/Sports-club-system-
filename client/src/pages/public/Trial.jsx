import React, { useState } from 'react';
import { leadService } from '../../services/leadService';
import { Sparkles, Calendar, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import Button from '../../components/common/Button';

export const Trial = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedSport: 'Tennis',
    preferredPlan: 'Gold',
    trialDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await leadService.createLead(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit trial request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24 space-y-12">
      <section className="bg-forest-950 text-cream-50 py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
            Experience The KHELORA Standard
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-cream-50">
            Book a Free 45-Minute Trial Session
          </h1>
          <p className="mt-2 text-sm text-cream-200 max-w-xl mx-auto">
            Experience our tournament Plexicushion courts, test the RoboArm bowling machine, and receive personal gameplay consultation from our ITF coaching staff.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-premium">
          {success ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-forest-950 mb-2">Trial Session Requested!</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-forest-950">{formData.name}</span>. Our hospitality front desk manager will contact you at <span className="font-semibold text-forest-950">{formData.phone}</span> to confirm your session timing.
              </p>
              <Button variant="primary" onClick={() => setSuccess(false)}>
                Submit Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Sharma"
                  className="w-full text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sport of Interest</label>
                  <select
                    value={formData.interestedSport}
                    onChange={(e) => setFormData({ ...formData, interestedSport: e.target.value })}
                    className="w-full text-xs p-3 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900"
                  >
                    <option value="Tennis">Lawn Tennis (Tournament Courts)</option>
                    <option value="Cricket">Cricket Nets (RoboArm & Turf)</option>
                    <option value="Both">Both Tennis & Cricket</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Membership Plan Preference</label>
                  <select
                    value={formData.preferredPlan}
                    onChange={(e) => setFormData({ ...formData, preferredPlan: e.target.value })}
                    className="w-full text-xs p-3 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900"
                  >
                    <option value="Gold">Gold Tier (Full Access & Free Courts)</option>
                    <option value="Silver">Silver Tier (50% Off Courts)</option>
                    <option value="Junior">Junior Tier (Under 18)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Trial Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.trialDate}
                  onChange={(e) => setFormData({ ...formData, trialDate: e.target.value })}
                  className="w-full text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Playing Experience / Goals (Optional)</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your current level (beginner, intermediate, competitive club player)..."
                  className="w-full text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
                />
              </div>

              <Button
                variant="gold"
                size="lg"
                type="submit"
                loading={submitting}
                className="w-full font-bold shadow-lg mt-2"
              >
                Schedule My Free Trial Session
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default Trial;
