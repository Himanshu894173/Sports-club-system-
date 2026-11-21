import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle, Award } from 'lucide-react';
import Button from '../../components/common/Button';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultPlan = searchParams.get('plan') || 'Gold';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    plan: defaultPlan
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/member/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-100">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-300 shadow-premium">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#193847] border border-[#C3FF01]/50 p-2 mx-auto flex items-center justify-center shadow-xl">
            <img src="/logo.svg" alt="KHELORA" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-4 text-2xl font-serif font-black text-[#0F161D] tracking-tight">
            Join KHELORA
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Create your member account and activate your athletic privileges.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Vikramaditya Mehta"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Choose Membership Tier</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900 font-semibold text-forest-950"
            >
              <option value="Gold">Gold Tier (₹45,000/yr - Free Courts & 15% Off)</option>
              <option value="Silver">Silver Tier (₹28,000/yr - 50% Off Courts)</option>
              <option value="Junior">Junior Tier (₹15,000/yr - Under 18 Athletes)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Account Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
              />
            </div>
          </div>

          <Button
            variant="gold"
            size="lg"
            type="submit"
            loading={loading}
            className="w-full font-bold shadow-lg mt-2"
          >
            Create Membership Account
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-forest-900 hover:text-gold-600">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;
