import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Briefcase, Plus, UserCheck, Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

export const Staff = () => {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Employee Modal
  const [addEmpModalOpen, setAddEmpModalOpen] = useState(false);
  const [empFormData, setEmpFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: 'Operations',
    shift: 'Morning (06:00 - 14:30)',
    salary: 40000
  });

  // Apply Leave Modal
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    type: 'Casual Leave',
    reason: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchStaffData = () => {
    setLoading(true);
    Promise.all([
      staffService.getEmployees().catch(() => []),
      staffService.getLeaves().catch(() => [])
    ]).then(([emps, lvs]) => {
      setEmployees(emps);
      setLeaves(lvs);
      if (emps.length > 0) {
        setLeaveFormData(prev => ({ ...prev, employeeId: emps[0].id }));
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await staffService.addEmployee(empFormData);
      setAddEmpModalOpen(false);
      setEmpFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        department: 'Operations',
        shift: 'Morning (06:00 - 14:30)',
        salary: 40000
      });
      fetchStaffData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await staffService.applyLeave(leaveFormData);
      setLeaveModalOpen(false);
      setLeaveFormData(prev => ({ ...prev, reason: '' }));
      fetchStaffData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLeave = async (id, status) => {
    try {
      await staffService.updateLeaveStatus(id, status);
      fetchStaffData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-cream-300 shadow-premium">
        <div>
          <h2 className="text-xl font-serif font-bold text-forest-950">Staff Operations, Shifts & Attendance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage coaching staff, front desk hospitality managers, and leave requests</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" onClick={() => setLeaveModalOpen(true)}>
            <Calendar className="w-4 h-4 mr-1.5" /> Apply for Leave
          </Button>
          <Button variant="gold" size="md" className="font-bold" onClick={() => setAddEmpModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Employee
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading employee rosters..." />
      ) : (
        <div className="space-y-8">
          {/* Employee Directory */}
          <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
            <div className="p-5 border-b border-cream-200">
              <h3 className="font-serif font-bold text-base text-forest-950">Employee Roster & Active Shifts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Department & Role</th>
                    <th className="p-4">Shift Schedule</th>
                    <th className="p-4">Compensation</th>
                    <th className="p-4">Attendance Today</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-cream-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-sm text-forest-950">{emp.name}</p>
                        <p className="text-[11px] text-gray-500">{emp.phone} • {emp.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-900">{emp.role}</span>
                        <p className="text-[10px] text-gold-700 font-semibold">{emp.department}</p>
                      </td>
                      <td className="p-4 font-mono font-medium text-gray-800">{emp.shift}</td>
                      <td className="p-4 font-bold text-forest-950">{formatCurrency(emp.salary)} / mo</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          emp.attendanceToday === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : (emp.attendanceToday === 'On Leave' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                        }`}>
                          {emp.attendanceToday}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Applications */}
          <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-premium">
            <div className="p-5 border-b border-cream-200 flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base text-forest-950">Staff Leave Applications</h3>
                <p className="text-xs text-gray-500">Review time-off requests and grant approvals</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-cream-100 border-b border-cream-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Leave Window</th>
                    <th className="p-4">Type & Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-cream-50">
                      <td className="p-4 font-bold text-forest-950">{l.employeeName}</td>
                      <td className="p-4 text-gray-600">{l.department}</td>
                      <td className="p-4 font-semibold text-gray-800">
                        {formatDate(l.startDate)} to {formatDate(l.endDate)}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-forest-900">{l.type}:</span> {l.reason}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          l.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : (l.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {l.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateLeave(l.id, 'approved')}
                              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateLeave(l.id, 'rejected')}
                              className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={addEmpModalOpen}
        onClose={() => setAddEmpModalOpen(false)}
        title="Add Staff Member"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={empFormData.name}
              onChange={(e) => setEmpFormData({ ...empFormData, name: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={empFormData.email}
                onChange={(e) => setEmpFormData({ ...empFormData, email: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                value={empFormData.phone}
                onChange={(e) => setEmpFormData({ ...empFormData, phone: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Job Title</label>
              <input
                type="text"
                required
                value={empFormData.role}
                onChange={(e) => setEmpFormData({ ...empFormData, role: e.target.value })}
                placeholder="e.g. Assistant Tennis Coach"
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
              <select
                value={empFormData.department}
                onChange={(e) => setEmpFormData({ ...empFormData, department: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
              >
                <option value="Operations">Operations</option>
                <option value="Sports Academy">Sports Academy</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shift Timings</label>
              <input
                type="text"
                value={empFormData.shift}
                onChange={(e) => setEmpFormData({ ...empFormData, shift: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                value={empFormData.salary}
                onChange={(e) => setEmpFormData({ ...empFormData, salary: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setAddEmpModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gold" size="md" type="submit" loading={submitting} className="font-bold">
              Enroll Staff
            </Button>
          </div>
        </form>
      </Modal>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Submit Staff Leave Request"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Employee</label>
            <select
              value={leaveFormData.employeeId}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, employeeId: e.target.value })}
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg bg-white"
              required
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={leaveFormData.startDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={leaveFormData.endDate}
                onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Leave Reason</label>
            <textarea
              rows={2}
              required
              value={leaveFormData.reason}
              onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
              placeholder="Medical appointment, family event..."
              className="w-full text-xs p-2.5 border border-cream-300 rounded-lg"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="outline" size="md" onClick={() => setLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={submitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Staff;
