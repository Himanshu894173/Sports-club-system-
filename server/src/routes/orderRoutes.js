import express from 'express';
import { orderController } from '../controllers/orderController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Member orders
router.get('/my-orders', protect, orderController.getMyOrders);

// Admin & Staff orders listing & KPIs
router.get('/', protect, authorize('admin', 'staff'), orderController.getOrders);

// Specific order retrieval, tracking and invoice
router.get('/:id', orderController.getOrderById);
router.get('/:id/tracking', orderController.getOrderTracking);
router.get('/:id/invoice', orderController.getOrderInvoice);

// Order Placement (Members & Guests with optional JWT)
router.post('/', optionalAuth, orderController.createOrder);

// Order Cancellation (Members for their orders or Admin/Staff)
router.post('/:id/cancel', protect, orderController.cancelOrder);

// Admin & Staff order workflow actions
router.patch('/:id/status', protect, authorize('admin', 'staff'), orderController.updateOrderStatus);
router.post('/:id/refund', protect, authorize('admin', 'staff'), orderController.refundOrder);
router.patch('/:id/archive', protect, authorize('admin', 'staff'), orderController.archiveOrder);

export default router;
