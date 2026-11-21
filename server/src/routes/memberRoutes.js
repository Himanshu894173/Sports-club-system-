import express from 'express';
import { memberController } from '../controllers/memberController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/plans', memberController.getPlans);
router.get('/', protect, authorize('admin', 'staff'), memberController.getMembers);
router.get('/:id', protect, memberController.getMemberById);
router.post('/', protect, authorize('admin', 'staff'), memberController.addMember);
router.put('/:id', protect, authorize('admin', 'staff'), memberController.updateMember);
router.post('/:id/renew', protect, authorize('admin', 'staff'), memberController.renewMembership);
router.patch('/:id/status', protect, authorize('admin', 'staff'), memberController.toggleStatus);

export default router;
