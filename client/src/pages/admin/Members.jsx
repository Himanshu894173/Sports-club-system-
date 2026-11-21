import React, { useState, useEffect } from 'react';
import { memberService } from '../../services/memberService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  RotateCw,
  Power,
  Shield,
  Eye,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Members = () => {
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeMember, setActiveMember] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    plan: 'Gold',
    emergencyContact: '',
    bloodGroup: '',
    sportsInterest: ['Tennis']
  });
  const [renewMonths, setRenewMonths] = useState(12);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchMembers = () => {
    setLoading(true);
    memberService.getMembers({ search, plan: selectedPlan, status: selectedStatus })
      .then(data => setMembers(data))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    memberService.getPlans().then(setPlans).catch(() => []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedPlan, selectedStatus]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await memberService.addMember(formData);
      setMessage('Member successfully enrolled into club registry.');
      setAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', plan: 'Gold', emergencyContact: '', bloodGroup: '', sportsInterest: ['Tennis'] });
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Error adding member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditMember = async (e) => {
    e.preventDefault();
    if (!activeMember) return;
    setSubmitting(true);
    try {
      await memberService.updateMember(activeMember.id, formData);
      setEditModalOpen(false);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Error updating member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenewMember = async (e) => {
    e.preventDefault();
    if (!activeMember) return;
    setSubmitting(true);
    try {
      await memberService.renewMembership(activeMember.id, {
        plan: formData.plan,
        durationMonths: renewMonths
      });
      setRenewModalOpen(false);
      fetchMembers();
    } catch (err) {
      alert(err.message || 'Error renewing membership.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await memberService.toggleStatus(id);
      fetchMembers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Members Directory & Plan Administration</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage player tiers, validity renewals, and emergency profiles</p>
        </div>

        <Button variant="gold" size="md" className="font-bold" onClick={() => setAddModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Enroll New Member
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, phone, email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-cream-300 rounded-xl focus:ring-1 focus:ring-forest-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="text-xs p-2 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900"
          >
            <option value="all">All Plans</option>
            <option value="Gold">Gold Tier</option>
            <option value="Silver">Silver Tier</option>
            <option value="Junior">Junior Tier</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-2 border border-cream-300 rounded-xl bg-white focus:ring-1 focus:ring-forest-900"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
        {loading ? (
          <Loader message="Loading membership database..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Member ID</th>
                  <th className="p-4">Name & Contact</th>
                  <th className="p-4">Tier</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {members.map((m) => {
                  const isExpired = new Date(m.expiryDate) < new Date();
                  return (
                    <tr key={m.id} className="hover:bg-cream-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-forest-950">{m.id}</td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-forest-950">{m.name}</p>
                        <p className="text-[11px] text-gray-500">{m.phone} • {m.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.plan.toLowerCase() === 'gold' ? 'bg-gold-100 text-gold-900 border border-gold-300' : 'bg-forest-100 text-forest-900'
                        }`}>
                          {m.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={isExpired ? 'text-rose-600 font-semibold' : 'text-gray-800'}>
                          {formatDate(m.expiryDate)}
                        </span>
                        {isExpired && <p className="text-[10px] text-rose-500 font-bold">Needs Renewal</p>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.status === 'active' ? 'bg-emerald-100 text-emerald-800' : (m.status === 'expired' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveMember(m);
                              setFormData({
                                name: m.name,
                                email: m.email,
                                phone: m.phone,
                                plan: m.plan,
                                emergencyContact: m.emergencyContact || '',
                                bloodGroup: m.bloodGroup || '',
                                sportsInterest: m.sportsInterest || ['Tennis']
                              });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-forest-900 hover:bg-cream-100"
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setActiveMember(m);
                              setFormData({ ...formData, plan: m.plan });
                              setRenewModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-gold-700 hover:text-gold-900 hover:bg-gold-50"
                            title="Renew Membership"
                          >
                            <RotateCw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(m.id)}
                            className={`p-1.5 rounded-lg ${m.status === 'active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                            title={m.status === 'active' ? 'Suspend Member' : 'Activate Member'}
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enroll New Member Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Enroll New Member"
        subtitle="Registers new member in system and records annual dues"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Membership Plan</label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
              >
                <option value="Gold">Gold Tier (₹45,000/yr)</option>
                <option value="Silver">Silver Tier (₹28,000/yr)</option>
                <option value="Junior">Junior Tier (₹15,000/yr)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Blood Group</label>
              <input
                type="text"
                placeholder="e.g. O+, A+"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Contact Number</label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="+91 98765 00000"
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-forest-900"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Enroll Member & Generate Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Profile - ${activeMember?.id}`}
      >
        <form onSubmit={handleEditMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Membership Plan</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
            >
              <option value="Gold">Gold Tier</option>
              <option value="Silver">Silver Tier</option>
              <option value="Junior">Junior Tier</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Renew Modal */}
      <Modal
        isOpen={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        title={`Renew Membership: ${activeMember?.name}`}
        subtitle={`Current Expiry: ${activeMember ? formatDate(activeMember.expiryDate) : ''}`}
      >
        <form onSubmit={handleRenewMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Renewal Tier</label>
            <select
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white font-bold"
            >
              <option value="Gold">Gold Plan (₹45,000/year)</option>
              <option value="Silver">Silver Plan (₹28,000/year)</option>
              <option value="Junior">Junior Plan (₹15,000/year)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Renewal Term</label>
            <select
              value={renewMonths}
              onChange={(e) => setRenewMonths(Number(e.target.value))}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
            >
              <option value={12}>12 Months (Full Annual Cycle)</option>
              <option value={6}>6 Months</option>
              <option value={1}>1 Month</option>
            </select>
          </div>

          <div className="bg-cream-100 p-4 rounded-xl text-xs space-y-1">
            <p className="font-bold text-forest-950">Renewal Fee:</p>
            <p className="text-sm font-bold text-emerald-700">
              {formData.plan === 'Gold' ? (renewMonths === 12 ? '₹45,000' : '₹25,000') : (renewMonths === 12 ? '₹28,000' : '₹15,000')}
            </p>
            <p className="text-gray-500 text-[11px]">This transaction will be recorded to the club ledger.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Confirm Renewal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Members;
