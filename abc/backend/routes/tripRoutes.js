import express from 'express';
import { 
  getTrips, 
  getTripByIdOrSlug, 
  createTrip, 
  updateTrip, 
  deleteTrip, 
  seedTrips 
} from '../controllers/tripController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Routes
router.get('/', getTrips);
router.get('/:idOrSlug', getTripByIdOrSlug);

// Admin Protected Routes
router.post('/seed', protect, adminOnly, seedTrips);
router.post('/', protect, adminOnly, createTrip);
router.put('/:id', protect, adminOnly, updateTrip);
router.delete('/:id', protect, adminOnly, deleteTrip);

export default router;
