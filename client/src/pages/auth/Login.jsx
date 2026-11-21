import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Shield, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import Button from '../../components/common/Button';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      // Route based on role if no explicit destination
      if (from) {
        navigate(from, { replace: true });
      } else if (data.user.role === 'admin' || data.user.role === 'staff') {
        navigate('/admin/pulse');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-100">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-cream-300 shadow-premium">
        {/* Brand Crest */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#193847] border border-[#C3FF01]/50 p-2 mx-auto flex items-center justify-center shadow-xl">
            <img src="/logo.svg" alt="KHELORA" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-4 text-2xl font-serif font-black text-[#0F161D] tracking-tight">
            Sign In to KHELORA
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Access your court bookings, pro shop orders, and club management portal.
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="p-3.5 rounded-2xl bg-cream-100 border border-cream-300">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-gold-600" /> Quick Demo Role Switcher:
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleFillCredentials('admin@championsclub.com', 'admin123')}
              className="py-1.5 px-2 rounded-lg bg-forest-900 text-cream-50 hover:bg-forest-800 font-semibold transition-all shadow-xs text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('staff@championsclub.com', 'staff123')}
              className="py-1.5 px-2 rounded-lg bg-forest-800 text-cream-50 hover:bg-forest-700 font-semibold transition-all shadow-xs text-center"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials('member@championsclub.com', 'member123')}
              className="py-1.5 px-2 rounded-lg bg-gold-500 text-forest-950 hover:bg-gold-400 font-bold transition-all shadow-xs text-center"
            >
              Gold Member
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Club Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@championsclub.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              <span className="text-[11px] text-gray-400">Default: admin123 / member123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            Authenticate & Sign In
          </Button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-600">
            Don't have a club membership yet?{' '}
            <Link to="/membership" className="font-bold text-forest-900 hover:text-gold-600">
              Apply for Membership
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
