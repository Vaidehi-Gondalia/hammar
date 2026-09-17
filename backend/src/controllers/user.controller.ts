import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import { updateProfileSchema } from '../validators/user.schema.js';
import { getUserProfile, updateUserProfile } from '../services/user.service.js';
import { uploadAvatar } from '../services/cloudinary.service.js';

export async function getMyProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  try {
    const user = await getUserProfile(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function updateMyProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  const result = updateProfileSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const user = await updateUserProfile(req.user.userId, result.data);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}

export async function uploadMyAvatar(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: 'Avatar file is required',
    });
  }

  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({
      message: 'Only image files are allowed',
    });
  }

  try {
    const uploadResult = await uploadAvatar(req.file);

    const user = await updateUserProfile(req.user.userId, {
      avatarUrl: uploadResult.secure_url,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'Avatar uploaded successfully',
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Avatar upload failed',
    });
  }
}
