import express from 'express';
import { bookingController } from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/availability', bookingController.getAvailability);
router.get('/my-bookings', protect, bookingController.getMyBookings);
router.get('/', protect, bookingController.getBookings);
router.post('/', protect, bookingController.createBooking);
router.patch('/:id/cancel', protect, bookingController.cancelBooking);

export default router;
