import { Lead, Member, User, MembershipPlan, Transaction } from '../models/index.js';

export const leadController = {
  async getLeads(req, res) {
    try {
      const { status, search } = req.query;
      const query = {};

      if (status && status !== 'all') {
        query.status = status;
      }
      if (search) {
        const q = search.trim();
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ];
      }

      const list = await Lead.find(query).sort({ createdAt: -1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving leads.', error: error.message });
    }
  },

  async createLead(req, res) {
    try {
      const {
        name,
        email,
        phone,
        interestedSport,
        membershipTier,
        source = 'Website Contact',
        trialDate,
        trialTime,
        notes
      } = req.body;

      if (!name || !email || !phone) {
        return res.status(400).json({ message: 'Name, email, and phone number are required.' });
      }

      // Basic email & phone validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
      }

      const leadId = `lead_${Date.now()}`;
      const newLead = await Lead.create({
        id: leadId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        interestedSport: interestedSport || 'Lawn Tennis',
        membershipTier: membershipTier || 'Gold',
        source: source || (trialDate ? 'Trial Booking' : 'Website Contact'),
        status: trialDate ? 'trial_scheduled' : 'new',
        trialDate: trialDate || null,
        trialTime: trialTime || null,
        assignedStaff: 'Front Desk Team',
        notes: notes ? notes.trim() : ''
      });

      res.status(201).json({
        message: trialDate
          ? 'Free trial session booked successfully! Our concierge team will reach out to confirm.'
          : 'Thank you! Your enquiry has been received. Our team will contact you shortly.',
        lead: newLead
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit enquiry.', error: error.message });
    }
  },

  async updateLead(req, res) {
    try {
      const lead = await Lead.findOne({ id: req.params.id });
      if (!lead) return res.status(404).json({ message: 'Lead not found.' });

      const { status, assignedStaff, notes, trialDate, trialTime } = req.body;
      if (status) lead.status = status;
      if (assignedStaff) lead.assignedStaff = assignedStaff;
      if (notes !== undefined) lead.notes = notes;
      if (trialDate) lead.trialDate = trialDate;
      if (trialTime) lead.trialTime = trialTime;

      await lead.save();
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: 'Error updating lead.', error: error.message });
    }
  },

  async convertLeadToMember(req, res) {
    try {
      const lead = await Lead.findOne({ id: req.params.id });
      if (!lead) return res.status(404).json({ message: 'Lead not found.' });

      // Check if member already exists with this email
      const existingMember = await Member.findOne({ email: lead.email });
      if (existingMember) {
        lead.status = 'converted';
        await lead.save();
        return res.status(400).json({
          message: `A registered member already exists with email '${lead.email}' (${existingMember.id}). Lead marked as converted.`,
          member: existingMember
        });
      }

      const count = await Member.countDocuments();
      const memberId = `MEM-2026-${String(count + 1).padStart(3, '0')}`;
      const chosenPlan = lead.membershipTier || 'Gold';

      // Create Member
      const newMember = await Member.create({
        id: memberId,
        userId: `usr_${Date.now()}`,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        plan: chosenPlan,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emergencyContact: '',
        bloodGroup: '',
        sportsInterest: [lead.interestedSport || 'Tennis'],
        totalBookings: 0,
        totalSpent: 0
      });

      // Create User Login
      const existingUser = await User.findOne({ email: lead.email });
      if (!existingUser) {
        await User.create({
          id: newMember.userId,
          name: lead.name,
          email: lead.email,
          password: 'member123',
          role: 'member',
          phone: lead.phone,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(lead.name)}`,
          memberId: newMember.id,
          plan: chosenPlan
        });
      }

      // Record transaction
      const planDoc = await MembershipPlan.findOne({ name: chosenPlan });
      const fee = planDoc ? planDoc.priceAnnual : 45000;

      await Transaction.create({
        id: `txn_${Date.now()}`,
        type: 'income',
        category: 'Membership',
        referenceId: newMember.id,
        description: `Lead Conversion to ${chosenPlan} Membership - ${newMember.name}`,
        amount: fee,
        method: 'Bank Transfer',
        status: 'paid',
        memberName: newMember.name,
        memberId: newMember.id
      });

      // Mark lead converted
      lead.status = 'converted';
      lead.notes = `${lead.notes || ''} [Converted to member #${memberId} on ${new Date().toISOString().split('T')[0]}]`;
      await lead.save();

      res.json({
        message: `Lead successfully converted into Member #${memberId}! Default password set to 'member123'.`,
        member: newMember,
        lead
      });
    } catch (error) {
      res.status(500).json({ message: 'Error converting lead to member.', error: error.message });
    }
  }
};

export default leadController;
