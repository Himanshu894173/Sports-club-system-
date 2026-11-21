import React, { useState } from 'react';
import { leadService } from '../../services/leadService';
import { MapPin, Phone, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedSport: 'General',
    preferredPlan: 'General',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await leadService.createLead(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Error submitting message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-24 space-y-12">
      {/* Header */}
      <section className="bg-forest-950 text-cream-50 py-16 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400 block mb-2">
            Connect With Concierge
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-cream-50">
            Contact KHELORA
          </h1>
          <p className="mt-2 text-sm text-cream-200 max-w-xl mx-auto">
            Our front desk and hospitality staff are available seven days a week to answer membership inquiries, schedule coaching sessions, or assist with tournament bookings.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details Card */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-premium space-y-6">
              <h3 className="font-serif font-bold text-2xl text-forest-950">
                Front Desk & Athletic Pavilion
              </h3>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-forest-950">Club Address</p>
                    <p>Estate 14, Royal Greens Blvd, Sector 62, Gurgaon, Haryana 122002</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-forest-950">Direct Lines</p>
                    <p>Front Desk: +91 (0124) 488-9000</p>
                    <p>Court Concierge: +91 (0124) 488-9001</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-forest-950">Electronic Mail</p>
                    <p>Inquiries: concierge@khelora.com</p>
                    <p>Accounts & Billing: accounts@khelora.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-forest-950">Operational Timings</p>
                    <p>Courts & Nets: 06:00 AM – 10:00 PM (Daily)</p>
                    <p>Cafeteria & Lounge: 06:30 AM – 10:30 PM (Daily)</p>
                    <p>Sports Pro Shop: 07:00 AM – 09:00 PM (Daily)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-8 rounded-3xl border border-cream-300 shadow-premium">
            <h3 className="font-serif font-bold text-2xl text-forest-950 mb-2">
              Send an Enquiry
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Fill in your details and our club manager will reach out within 2 hours.
            </p>

            {submitted ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-xl text-forest-950 mb-1">Message Delivered</h4>
                <p className="text-xs text-gray-600 mb-4">
                  We have logged your enquiry into our club concierge system.
                </p>
                <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya Roy"
                    className="w-full text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
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
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">How can we assist you?</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about membership inquiries, court reservations, or corporate events..."
                    className="w-full text-xs p-3 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
                  />
                </div>

                <Button
                  variant="gold"
                  size="lg"
                  type="submit"
                  loading={submitting}
                  className="w-full font-bold shadow-md"
                >
                  Send Club Enquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Contact;
