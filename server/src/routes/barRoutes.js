import express from 'express';
import { barController } from '../controllers/barController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// 1. Menu Management
router.get('/menu', barController.getMenu);
router.post('/menu', protect, authorize('admin', 'staff'), barController.createMenuItem);
router.put('/menu/:id', protect, authorize('admin', 'staff'), barController.updateMenuItem);
router.delete('/menu/:id', protect, authorize('admin'), barController.deleteMenuItem);
router.patch('/menu/:id/stock', protect, authorize('admin', 'staff'), barController.updateMenuItemStock);

// 2. Table Management
router.get('/tables', barController.getTables);
router.patch('/tables/:id/status', protect, authorize('admin', 'staff'), barController.updateTableStatus);
router.post('/tables/:id/transfer', protect, authorize('admin', 'staff'), barController.transferTable);
router.post('/tables/:id/release', protect, authorize('admin', 'staff'), barController.releaseTable);

// 3. Orders, Tabs & POS
router.get('/orders', protect, barController.getOrders);
router.get('/orders/:id', protect, barController.getOrderById);
router.post('/orders', protect, barController.createOrder);
router.post('/orders/:id/items', protect, authorize('admin', 'staff'), barController.addItemsToOrder);
router.put('/orders/:id/items', protect, authorize('admin', 'staff'), barController.updateOrderItems);
router.patch('/orders/:id/kitchen-status', protect, authorize('admin', 'staff'), barController.updateKitchenStatus);
router.post('/orders/:id/settle', protect, authorize('admin', 'staff'), barController.settleOrder);
router.post('/orders/:id/split', protect, authorize('admin', 'staff'), barController.splitOrder);
router.post('/orders/:id/cancel', protect, authorize('admin', 'staff'), barController.cancelOrder);
router.get('/orders/:id/invoice', protect, barController.getInvoice);

// 4. Reports & Analytics
router.get('/reports', protect, authorize('admin', 'staff'), barController.getReports);

export default router;
