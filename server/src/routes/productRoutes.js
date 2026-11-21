import express from 'express';
import { productController } from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/inventory/movements', protect, authorize('admin', 'staff'), productController.getInventoryMovements);
router.post('/inventory/adjust', protect, authorize('admin', 'staff'), productController.adjustInventory);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', protect, authorize('admin', 'staff'), productController.addProduct);
router.put('/:id', protect, authorize('admin', 'staff'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin', 'staff'), productController.deleteProduct);

export default router;
