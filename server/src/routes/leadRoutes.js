import express from 'express';
import { leadController } from '../controllers/leadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', leadController.createLead); // Public endpoint for website
router.get('/', protect, authorize('admin', 'staff'), leadController.getLeads);
router.put('/:id', protect, authorize('admin', 'staff'), leadController.updateLead);
router.post('/:id/convert', protect, authorize('admin', 'staff'), leadController.convertLeadToMember);

export default router;
