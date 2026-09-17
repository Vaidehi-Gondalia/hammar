import { Router } from 'express';
import { authenticate } from '../auth/auth.middleware.js';
import {
  cancelAuctionHandler,
  createAuctionHandler,
  getAuctionByIdHandler,
  getAuctionsHandler,
  getMyAuctionsHandler,
  updateAuctionHandler,
  uploadAuctionImagesHandler,
  getAuctionImagesHandler,
  deleteAuctionImageHandler,
} from '../controllers/auction.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/', getAuctionsHandler);

router.post('/', authenticate, createAuctionHandler);

router.get('/my', authenticate, getMyAuctionsHandler);

router.patch('/:id/cancel', authenticate, cancelAuctionHandler);

router.patch('/:id', authenticate, updateAuctionHandler);

router.post(
  '/:id/images',
  authenticate,
  upload.array('images', 10),
  uploadAuctionImagesHandler,
);

router.get('/:id/images', getAuctionImagesHandler);

router.delete(
  '/:auctionId/images/:imageId',
  authenticate,
  deleteAuctionImageHandler,
);

router.get('/:id', getAuctionByIdHandler);

export default router;
