import { Member, MembershipPlan, Booking, Order, BarOrder, Transaction, User } from '../models/index.js';

export const memberController = {
  async getMembers(req, res) {
    try {
      const { search, plan, status } = req.query;
      const query = {};

      if (plan && plan !== 'all') {
        query.plan = plan;
      }
      if (status && status !== 'all') {
        query.status = status;
      }
      if (search) {
        const q = search.trim();
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { id: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ];
      }

      const list = await Member.find(query).sort({ createdAt: -1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving members.', error: error.message });
    }
  },

  async getMembershipPlans(req, res) {
    try {
      const plans = await MembershipPlan.find().sort({ priceAnnual: -1 });
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving plans.', error: error.message });
    }
  },

  async getMemberById(req, res) {
    try {
      const member = await Member.findOne({ id: req.params.id });
      if (!member) {
        return res.status(404).json({ message: 'Member not found.' });
      }

      const recentBookings = await Booking.find({ memberId: member.id }).sort({ date: -1, startTime: -1 }).limit(5);
      const recentOrders = await Order.find({ memberId: member.id }).sort({ createdAt: -1 }).limit(5);

      res.json({
        ...member.toJSON(),
        recentBookings,
        recentOrders
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving member details.', error: error.message });
    }
  },

  async addMember(req, res) {
    try {
      const { name, email, phone, plan = 'Gold', emergencyContact, bloodGroup, sportsInterest } = req.body;
      if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Name, email, and phone are required.' });
      }

      const existing = await Member.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ message: 'A member with this email already exists.' });
      }

      const count = await Member.countDocuments();
      const memberId = `MEM-2026-${String(count + 1).padStart(3, '0')}`;

      const newMember = await Member.create({
        id: memberId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        plan,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emergencyContact: emergencyContact || '',
        bloodGroup: bloodGroup || '',
        sportsInterest: Array.isArray(sportsInterest) ? sportsInterest : ['Tennis'],
        totalBookings: 0,
        totalSpent: 0
      });

      const planDoc = await MembershipPlan.findOne({ name: plan });
      const fee = planDoc ? planDoc.priceAnnual : 45000;

      await Transaction.create({
        id: `txn_${Date.now()}`,
        type: 'income',
        category: 'Membership',
        referenceId: newMember.id,
        description: `Annual ${plan} Membership - ${newMember.name}`,
        amount: fee,
        method: 'Bank Transfer',
        status: 'paid',
        memberName: newMember.name,
        memberId: newMember.id
      });

      res.status(201).json(newMember);
    } catch (error) {
      res.status(500).json({ message: 'Failed to add member.', error: error.message });
    }
  },

  async updateMember(req, res) {
    try {
      const member = await Member.findOne({ id: req.params.id });
      if (!member) {
        return res.status(404).json({ message: 'Member not found.' });
      }

      const { name, phone, plan, status, emergencyContact, bloodGroup, sportsInterest } = req.body;
      if (name) member.name = name.trim();
      if (phone) member.phone = phone.trim();
      if (plan) member.plan = plan;
      if (status) member.status = status;
      if (emergencyContact !== undefined) member.emergencyContact = emergencyContact;
      if (bloodGroup !== undefined) member.bloodGroup = bloodGroup;
      if (sportsInterest) member.sportsInterest = Array.isArray(sportsInterest) ? sportsInterest : [sportsInterest];

      await member.save();
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: 'Error updating member.', error: error.message });
    }
  },

  async renewMembership(req, res) {
    try {
      const member = await Member.findOne({ id: req.params.id });
      if (!member) {
        return res.status(404).json({ message: 'Member not found.' });
      }

      const { duration = 'annual', paymentMethod = 'UPI' } = req.body;
      const daysToAdd = duration === 'monthly' ? 30 : 365;

      const currentExpiry = new Date(member.expiryDate);
      const now = new Date();
      const baseDate = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      member.expiryDate = newExpiry.toISOString().split('T')[0];
      member.status = 'active';
      await member.save();

      const planDoc = await MembershipPlan.findOne({ name: member.plan });
      const amount = planDoc ? (duration === 'monthly' ? planDoc.priceMonthly : planDoc.priceAnnual) : 45000;

      await Transaction.create({
        id: `txn_${Date.now()}`,
        type: 'income',
        category: 'Membership',
        referenceId: member.id,
        description: `Renewal of ${member.plan} Plan (${duration}) - ${member.name}`,
        amount,
        method: paymentMethod,
        status: 'paid',
        memberName: member.name,
        memberId: member.id
      });

      res.json({
        message: `Membership successfully renewed until ${member.expiryDate}`,
        member
      });
    } catch (error) {
      res.status(500).json({ message: 'Error renewing membership.', error: error.message });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      if (!['active', 'expired', 'suspended'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be active, expired, or suspended.' });
      }

      const member = await Member.findOne({ id: req.params.id });
      if (!member) {
        return res.status(404).json({ message: 'Member not found.' });
      }

      member.status = status;
      await member.save();
      res.json({ message: `Member status updated to ${status}.`, member });
    } catch (error) {
      res.status(500).json({ message: 'Error updating member status.', error: error.message });
    }
  }
};

// Aliases for route mapping
memberController.getPlans = memberController.getMembershipPlans;
memberController.toggleStatus = memberController.updateStatus;

export default memberController;
