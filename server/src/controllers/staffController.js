import { Employee, LeaveRequest } from '../models/index.js';

export const staffController = {
  async getStaff(req, res) {
    try {
      const { department, status } = req.query;
      const query = {};
      if (department && department !== 'all') query.department = department;
      if (status && status !== 'all') query.status = status;

      const list = await Employee.find(query).sort({ name: 1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving staff records.', error: error.message });
    }
  },

  async addStaff(req, res) {
    try {
      const { name, email, phone, role, department, shift, salary, joinDate } = req.body;
      if (!name || !email || !role) {
        return res.status(400).json({ message: 'Name, email, and role are required.' });
      }

      const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ message: 'An employee with this email already exists.' });
      }

      const employeeId = `stf_${Date.now()}`;
      const newStaff = await Employee.create({
        id: employeeId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : 'N/A',
        role: role.trim(),
        department: department || 'Front Desk',
        shift: shift || 'Morning (06:00 - 14:00)',
        salary: Number(salary) || 35000,
        joinDate: joinDate || new Date().toISOString().split('T')[0],
        status: 'Active'
      });

      res.status(201).json(newStaff);
    } catch (error) {
      res.status(500).json({ message: 'Failed to add staff member.', error: error.message });
    }
  },

  async updateStaff(req, res) {
    try {
      const staff = await Employee.findOne({ id: req.params.id });
      if (!staff) return res.status(404).json({ message: 'Employee not found.' });

      const { name, phone, role, department, shift, salary, status } = req.body;
      if (name) staff.name = name.trim();
      if (phone) staff.phone = phone.trim();
      if (role) staff.role = role.trim();
      if (department) staff.department = department;
      if (shift) staff.shift = shift;
      if (salary !== undefined) staff.salary = Number(salary);
      if (status) staff.status = status;

      await staff.save();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: 'Error updating staff record.', error: error.message });
    }
  },

  async getLeaveRequests(req, res) {
    try {
      const { status } = req.query;
      const query = {};
      if (status && status !== 'all') query.status = status;

      const list = await LeaveRequest.find(query).sort({ createdAt: -1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving leave requests.', error: error.message });
    }
  },

  async applyLeave(req, res) {
    try {
      const { employeeId, employeeName, leaveType, startDate, endDate, days, reason } = req.body;
      if (!startDate || !endDate || !reason) {
        return res.status(400).json({ message: 'Start date, end date, and reason are required.' });
      }

      const leaveId = `leave_${Date.now()}`;
      const newLeave = await LeaveRequest.create({
        id: leaveId,
        employeeId: employeeId || 'stf_curr',
        employeeName: employeeName || (req.user ? req.user.name : 'Club Employee'),
        leaveType: leaveType || 'Casual Leave',
        startDate,
        endDate,
        days: Number(days) || 1,
        reason,
        status: 'pending'
      });

      res.status(201).json({
        message: 'Leave application submitted for managerial approval.',
        leave: newLeave
      });
    } catch (error) {
      res.status(500).json({ message: 'Error submitting leave application.', error: error.message });
    }
  },

  async reviewLeave(req, res) {
    try {
      const { status } = req.body;
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status must be approved or rejected.' });
      }

      const leave = await LeaveRequest.findOne({ id: req.params.id });
      if (!leave) return res.status(404).json({ message: 'Leave application not found.' });

      leave.status = status;
      leave.reviewedBy = req.user ? req.user.name : 'Club Administrator';
      await leave.save();

      if (status === 'approved' && leave.employeeId) {
        await Employee.updateOne({ id: leave.employeeId }, { $set: { status: 'On Leave' } });
      }

      res.json({
        message: `Leave application marked as '${status}'.`,
        leave
      });
    } catch (error) {
      res.status(500).json({ message: 'Error reviewing leave application.', error: error.message });
    }
  }
};

// Aliases for route mapping
staffController.getEmployees = staffController.getStaff;
staffController.addEmployee = staffController.addStaff;
staffController.updateEmployee = staffController.updateStaff;
staffController.getLeaves = staffController.getLeaveRequests;
staffController.updateLeaveStatus = staffController.reviewLeave;

export default staffController;
