import express from 'express';
import { getTripReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public Route for fetching reviews of a trip
router.get('/trip/:tripId', getTripReviews);

// Protected Route for submitting a review
router.post('/', protect, createReview);

export default router;
