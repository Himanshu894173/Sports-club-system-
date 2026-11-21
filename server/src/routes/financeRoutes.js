import express from 'express';
import { financeController } from '../controllers/financeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin', 'staff'), financeController.getDashboardStats);
router.get('/transactions', protect, authorize('admin', 'staff'), financeController.getTransactions);
router.get('/invoices/:id', financeController.getInvoice);
router.get('/corporate', protect, authorize('admin'), financeController.getCorporateClients);
router.post('/expenses', protect, authorize('admin'), financeController.addExpense);

export default router;
