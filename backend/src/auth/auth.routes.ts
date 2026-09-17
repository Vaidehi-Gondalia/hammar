import { Router } from 'express';

import {
  login,
  logout,
  refresh,
  register,
  getCurrentUser,
  logoutAllDevices,
  setupTwoFactorAuth,
  verifyTwoFactorAuth,
  verifyTwoFactorLogin,
  forgotPasswordController,
  resetPasswordController,
} from './auth.controller.js';

import { authenticate, authenticateTwoFactorSetup } from './auth.middleware.js';

import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

router.post('/register', upload.single('avatar'), register);

router.post('/login', login);

router.post('/forgot-password', forgotPasswordController);

router.post('/reset-password', resetPasswordController);

router.post('/logout', logout);

router.post('/refresh', refresh);

router.get('/me', authenticate, getCurrentUser);

router.post('/logout-all', authenticate, logoutAllDevices);

router.post('/2fa/setup', authenticateTwoFactorSetup, setupTwoFactorAuth);

router.post('/2fa/verify', authenticateTwoFactorSetup, verifyTwoFactorAuth);

router.post('/2fa/login', verifyTwoFactorLogin);

export default router;
