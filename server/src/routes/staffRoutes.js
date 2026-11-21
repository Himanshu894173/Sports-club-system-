import express from 'express';
import { staffController } from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'staff'), staffController.getEmployees);
router.post('/', protect, authorize('admin'), staffController.addEmployee);
router.put('/:id', protect, authorize('admin'), staffController.updateEmployee);

router.get('/leaves', protect, authorize('admin', 'staff'), staffController.getLeaves);
router.post('/leaves', protect, staffController.applyLeave);
router.patch('/leaves/:id', protect, authorize('admin'), staffController.updateLeaveStatus);

export default router;
