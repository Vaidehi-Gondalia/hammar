import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.middleware.js';
import {
  createAuctionSchema,
  updateAuctionSchema,
} from '../validators/auction.schema.js';
import {
  cancelAuction,
  createAuction,
  getAuctionById,
  getAuctionImages,
  getAuctions,
  getMyAuctions,
  deleteAuctionImage,
  updateAuction,
  uploadAuctionImages,
  verifyAuctionOwnership,
} from '../services/auction.service.js';

export async function createAuctionHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  const parsed = createAuctionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid auction data',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      message: 'Only sellers can create auctions',
    });
  }

  const sellerId = req.user.userId;

  const auction = await createAuction(sellerId, parsed.data);

  return res.status(201).json({
    message: 'Auction created successfully',
    auction,
  });
}

export async function getMyAuctionsHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      message: 'Only sellers can view their auctions',
    });
  }

  const auctions = await getMyAuctions(req.user.userId);

  return res.status(200).json({
    auctions,
  });
}

export async function getAuctionsHandler(req: Request, res: Response) {
  const status = req.query.status;

  const validStatuses = ['scheduled', 'live', 'closed', 'cancelled'] as const;

  if (
    status !== undefined &&
    (typeof status !== 'string' ||
      !validStatuses.includes(status as (typeof validStatuses)[number]))
  ) {
    return res.status(400).json({
      message: 'Invalid auction status',
    });
  }

  const auctions = await getAuctions(
    status as (typeof validStatuses)[number] | undefined,
  );

  return res.status(200).json({
    auctions,
  });
}

export async function getAuctionByIdHandler(req: Request, res: Response) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: 'Auction ID is required',
    });
  }

  const auction = await getAuctionById(id as string);

  if (!auction) {
    return res.status(404).json({
      message: 'Auction not found',
    });
  }

  return res.status(200).json({
    auction,
  });
}

export async function updateAuctionHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      message: 'Auction ID is required',
    });
  }

  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      message: 'Only sellers can update auctions',
    });
  }

  const parsed = updateAuctionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid auction data',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const auction = await updateAuction(id, req.user.userId, parsed.data);

  if (!auction) {
    return res.status(404).json({
      message: 'Auction not found or cannot be updated',
    });
  }

  return res.status(200).json({
    message: 'Auction updated successfully',
    auction,
  });
}

export async function cancelAuctionHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      message: 'Auction ID is required',
    });
  }

  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      message: 'Only sellers can cancel auctions',
    });
  }

  const auction = await cancelAuction(id, req.user.userId);

  if (!auction) {
    return res.status(404).json({
      message: 'Auction not found or cannot be cancelled',
    });
  }

  return res.status(200).json({
    message: 'Auction cancelled successfully',
    auction,
  });
}

export async function uploadAuctionImagesHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      message: 'Auction ID is required',
    });
  }

  if (!req.user) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  if (req.user.role !== 'seller') {
    return res.status(403).json({
      message: 'Only sellers can upload auction images',
    });
  }

  const auction = await verifyAuctionOwnership(id, req.user.userId);

  if (!auction) {
    return res.status(404).json({
      message: 'Auction not found or you do not own this auction',
    });
  }

  const files = req.files as Express.Multer.File[] | undefined;

  if (!files || files.length === 0) {
    return res.status(400).json({
      message: 'At least one auction image is required',
    });
  }

  const images = await uploadAuctionImages(id, files);

  return res.status(201).json({
    message: 'Auction images uploaded successfully',
    images,
  });
}

export async function getAuctionImagesHandler(req: Request, res: Response) {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      message: 'Auction ID is required',
    });
  }

  const images = await getAuctionImages(id);

  return res.status(200).json({
    images,
  });
}

export async function deleteAuctionImageHandler(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const auctionId = req.params.auctionId as string;
    const imageId = req.params.imageId as string;
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
      });
    }

    if (req.user.role !== 'seller') {
      return res.status(403).json({
        message: 'Only sellers can delete auction images',
      });
    }

    if (!auctionId || !imageId) {
      return res.status(400).json({
        message: 'Auction ID and image ID are required',
      });
    }

    const image = await deleteAuctionImage(auctionId, imageId, req.user.userId);

    if (!image) {
      return res.status(404).json({
        message: 'Auction or image not found',
      });
    }

    return res.status(200).json({
      message: 'Auction image deleted successfully',
      image,
    });
  } catch (error) {
    console.error('Delete auction image error:', error);

    return res.status(500).json({
      message: 'Failed to delete auction image',
    });
  }
}
