import React, { useState, useEffect } from 'react';
import { leadService } from '../../services/leadService';
import { formatDate } from '../../utils/formatters';
import { UserCheck, Search, Filter, Phone, Mail, Calendar, CheckCircle2, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Lead Details / Follow-up Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [trialScheduleDate, setTrialScheduleDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeads = () => {
    setLoading(true);
    leadService.getLeads({ status: selectedStatus })
      .then(setLeads)
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedStatus]);

  const handleUpdateStatus = async (leadId, nextStatus) => {
    try {
      await leadService.updateLead(leadId, { status: nextStatus });
      fetchLeads();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConvertToMember = async (leadId) => {
    if (!window.confirm('Convert this prospective lead into an active club member?')) return;
    try {
      const res = await leadService.convertToMember(leadId);
      alert(`Success! Lead converted to Member ID: ${res.member.id}`);
      fetchLeads();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddNoteAndSchedule = async (e) => {
    e.preventDefault();
    if (!activeLead) return;
    setSubmitting(true);

    try {
      await leadService.updateLead(activeLead.id, {
        note: newNote,
        trialDate: trialScheduleDate || activeLead.trialDate,
        status: trialScheduleDate ? 'trial_scheduled' : activeLead.status
      });
      setNoteModalOpen(false);
      setNewNote('');
      fetchLeads();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Leads, Prospects & Trial Bookings</h2>
          <p className="text-xs text-gray-500 mt-0.5">Follow up with prospective athletes, schedule trials, and convert to members</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-gray-700">Filter Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-2 border border-cream-300 rounded-xl bg-white"
          >
            <option value="all">All Enquiries</option>
            <option value="new">New Inquiries</option>
            <option value="contacted">Contacted</option>
            <option value="trial_scheduled">Trial Scheduled</option>
            <option value="converted">Converted to Member</option>
          </select>
        </div>
        <p className="text-xs text-gray-500">{leads.length} leads found</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
        {loading ? (
          <Loader message="Loading prospective leads..." />
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-serif font-bold text-base text-gray-700">No leads matching filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Interested Sport & Plan</th>
                  <th className="p-4">Trial Date</th>
                  <th className="p-4">Assigned Staff</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-cream-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-sm text-forest-950">{lead.name}</p>
                      <p className="text-[11px] text-gray-500">{lead.phone} • {lead.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-forest-900">{lead.interestedSport}</span>
                      <p className="text-[10px] text-gold-700 font-semibold">{lead.preferredPlan} Plan Interest</p>
                    </td>
                    <td className="p-4">
                      {lead.trialDate ? (
                        <span className="font-bold text-emerald-700">{formatDate(lead.trialDate)}</span>
                      ) : (
                        <span className="text-gray-400 italic">Not scheduled</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-700">{lead.assignedTo || 'Unassigned'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'converted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.status === 'trial_scheduled'
                          ? 'bg-gold-100 text-gold-900'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveLead(lead);
                            setTrialScheduleDate(lead.trialDate || '');
                            setNoteModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 text-forest-900 font-semibold"
                        >
                          Notes / Trial
                        </button>

                        {lead.status !== 'converted' && (
                          <Button
                            variant="gold"
                            size="sm"
                            className="font-bold text-[11px]"
                            onClick={() => handleConvertToMember(lead.id)}
                          >
                            Convert to Member
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note / Trial Schedule Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title={activeLead ? `Lead Notes & Trial: ${activeLead.name}` : ''}
      >
        {activeLead && (
          <form onSubmit={handleAddNoteAndSchedule} className="space-y-4">
            <div className="bg-cream-100 p-4 rounded-xl text-xs space-y-1">
              <p><span className="font-bold">Original Enquiry:</span> "{activeLead.message || 'No additional message.'}"</p>
              <p><span className="font-bold">Received:</span> {formatDate(activeLead.createdAt)}</p>
            </div>

            {/* Existing Notes */}
            <div>
              <p className="text-xs font-bold text-gray-700 mb-2">Follow-up History:</p>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {activeLead.notes?.map((n, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-cream-50 border border-cream-200 text-xs">
                    <p className="text-gray-800">{n.note}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">By {n.by} on {formatDate(n.date)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Schedule 45-Min Trial Date</label>
              <input
                type="date"
                value={trialScheduleDate}
                onChange={(e) => setTrialScheduleDate(e.target.value)}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Add Follow-up Note</label>
              <textarea
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log discussion notes, preferred court time, player questions..."
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button variant="outline" size="md" onClick={() => setNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit" loading={submitting}>
                Save Follow-up
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
export default Leads;
