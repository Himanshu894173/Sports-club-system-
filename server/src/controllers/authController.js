import jwt from 'jsonwebtoken';
import { User, Member, Transaction } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'champions_club_secret_key_2026_super_secure';

export const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      // Case-insensitive email search
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = jwt.sign(
        { id: user.id || user._id.toString(), role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Lookup member details if applicable
      const member = await Member.findOne({
        $or: [
          { userId: user.id },
          { email: user.email }
        ]
      });

      res.json({
        token,
        user: {
          id: user.id || user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          memberId: member ? member.id : user.memberId || null,
          plan: member ? member.plan : user.plan || null
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Login failed due to a server error.', error: error.message });
    }
  },

  async register(req, res) {
    try {
      const { name, email, password, phone, plan = 'Gold' } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required.' });
      }

      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      const userId = `usr_${Date.now()}`;
      const count = await Member.countDocuments();
      const memberId = `MEM-2026-${String(count + 1).padStart(3, '0')}`;

      const newUser = await User.create({
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: 'member',
        phone: phone ? phone.trim() : '',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        memberId,
        plan
      });

      // Create member profile
      const newMember = await Member.create({
        id: memberId,
        userId: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : '',
        plan,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emergencyContact: '',
        bloodGroup: '',
        sportsInterest: ['Tennis'],
        totalBookings: 0,
        totalSpent: 0
      });

      const token = jwt.sign(
        { id: newUser.id, role: newUser.role, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          avatar: newUser.avatar,
          memberId: newMember.id,
          plan: newMember.plan
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed.', error: error.message });
    }
  },

  async getMe(req, res) {
    try {
      const user = await User.findOne({
        $or: [
          { _id: req.user.id.match(/^[0-9a-fA-F]{24}$/) ? req.user.id : null },
          { id: req.user.id }
        ].filter(Boolean)
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const member = await Member.findOne({
        $or: [
          { userId: user.id },
          { email: user.email }
        ]
      });

      res.json({
        id: user.id || user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        memberId: member ? member.id : user.memberId || null,
        plan: member ? member.plan : user.plan || null
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving profile.', error: error.message });
    }
  },

  async updateProfile(req, res) {
    try {
      const { name, phone, avatar } = req.body;
      const user = await User.findOne({
        $or: [
          { _id: req.user.id.match(/^[0-9a-fA-F]{24}$/) ? req.user.id : null },
          { id: req.user.id }
        ].filter(Boolean)
      });

      if (!user) return res.status(404).json({ message: 'User not found.' });

      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim();
      if (avatar) user.avatar = avatar;
      await user.save();

      // Update matching member record
      await Member.updateMany(
        { $or: [{ userId: user.id }, { email: user.email }] },
        { $set: { name: user.name, phone: user.phone } }
      );

      res.json({
        message: 'Profile updated successfully.',
        user: {
          id: user.id || user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
  }
};

export default authController;
