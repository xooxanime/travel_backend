import express from 'express';
import {
  uploadImageController,
  uploadVideoController,
  uploadBase64Controller,
  deleteMediaController
} from '../controllers/uploadController.js';
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadSingleVideo,
  handleMulterError
} from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// POST /api/upload/image — single image
router.post(
  '/image',
  (req, res, next) => uploadSingleImage(req, res, (err) => handleMulterError(err, req, res, next)),
  uploadImageController
);

// POST /api/upload/images — multiple images (up to 10)
router.post(
  '/images',
  (req, res, next) => uploadMultipleImages(req, res, (err) => handleMulterError(err, req, res, next)),
  uploadImageController
);

// POST /api/upload/video — single video
router.post(
  '/video',
  (req, res, next) => uploadSingleVideo(req, res, (err) => handleMulterError(err, req, res, next)),
  uploadVideoController
);

// POST /api/upload/base64 — base64 data URI upload
router.post('/base64', uploadBase64Controller);

// DELETE /api/upload/media — delete by Cloudinary public_id
router.delete('/media', deleteMediaController);

export default router;
