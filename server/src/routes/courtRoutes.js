import express from 'express';
import { bookingController } from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', bookingController.getCourts);
router.get('/:id', bookingController.getCourtById);

export default router;
