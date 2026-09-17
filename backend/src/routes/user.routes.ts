import { Router } from 'express';

import { authenticate } from '../auth/auth.middleware.js';

import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
} from '../controllers/user.controller.js';

import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.get('/me', authenticate, getMyProfile);

router.patch('/me', authenticate, updateMyProfile);

router.post(
  '/me/avatar',
  authenticate,
  upload.single('avatar'),
  uploadMyAvatar,
);

export default router;
