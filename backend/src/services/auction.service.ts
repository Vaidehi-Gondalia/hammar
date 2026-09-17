import { db } from '../db/index.js';
import { and, eq, or } from 'drizzle-orm';
import { auctions, auctionImages } from '../db/schema.js';
import {
  deleteCloudinaryImage,
  uploadAuctionImage,
} from './cloudinary.service.js';
import type {
  CreateAuctionInput,
  UpdateAuctionInput,
} from '../validators/auction.schema.js';

export async function createAuction(
  sellerId: string,
  data: CreateAuctionInput,
) {
  const [auction] = await db
    .insert(auctions)
    .values({
      sellerId,
      title: data.title,
      description: data.description,
      category: data.category,
      startingPrice: data.startingPrice,
      reservePrice: data.reservePrice,
      startTime: data.startTime,
      endTime: data.endTime,
    })
    .returning();

  return auction;
}

export async function getMyAuctions(sellerId: string) {
  return db
    .select()
    .from(auctions)
    .where(eq(auctions.sellerId, sellerId))
    .orderBy(auctions.createdAt);
}

export async function getAuctions(
  status?: 'scheduled' | 'live' | 'closed' | 'cancelled',
) {
  const query = db.select().from(auctions);

  if (status) {
    return query.where(eq(auctions.status, status)).orderBy(auctions.startTime);
  }

  return query
    .where(or(eq(auctions.status, 'scheduled'), eq(auctions.status, 'live')))
    .orderBy(auctions.startTime);
}

export async function getAuctionById(auctionId: string) {
  const [auction] = await db
    .select()
    .from(auctions)
    .where(eq(auctions.id, auctionId));

  if (!auction) {
    return undefined;
  }

  const images = await db
    .select()
    .from(auctionImages)
    .where(eq(auctionImages.auctionId, auctionId))
    .orderBy(auctionImages.sortOrder);

  return {
    ...auction,
    images,
  };
}

export async function updateAuction(
  auctionId: string,
  sellerId: string,
  data: UpdateAuctionInput,
) {
  const [auction] = await db
    .update(auctions)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(auctions.id, auctionId),
        eq(auctions.sellerId, sellerId),
        eq(auctions.status, 'scheduled'),
      ),
    )
    .returning();

  return auction;
}

export async function cancelAuction(auctionId: string, sellerId: string) {
  const [auction] = await db
    .update(auctions)
    .set({
      status: 'cancelled',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(auctions.id, auctionId),
        eq(auctions.sellerId, sellerId),
        eq(auctions.status, 'scheduled'),
      ),
    )
    .returning();

  return auction;
}

export async function addAuctionImage(
  auctionId: string,
  imageUrl: string,
  publicId: string,
  sortOrder: number,
) {
  const [image] = await db
    .insert(auctionImages)
    .values({
      auctionId,
      imageUrl,
      publicId,
      sortOrder,
    })
    .returning();

  return image;
}

export async function uploadAuctionImages(
  auctionId: string,
  files: Express.Multer.File[],
) {
  const existingImages = await getAuctionImages(auctionId);

  const uploadedImages = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadAuctionImage(files[i]);

    const image = await addAuctionImage(
      auctionId,
      result.secure_url,
      result.public_id,
      existingImages.length + i,
    );

    uploadedImages.push(image);
  }

  return uploadedImages;
}

export async function verifyAuctionOwnership(
  auctionId: string,
  sellerId: string,
) {
  const [auction] = await db
    .select({
      id: auctions.id,
    })
    .from(auctions)
    .where(and(eq(auctions.id, auctionId), eq(auctions.sellerId, sellerId)));

  return auction;
}

export async function getAuctionImages(auctionId: string) {
  return db
    .select()
    .from(auctionImages)
    .where(eq(auctionImages.auctionId, auctionId))
    .orderBy(auctionImages.sortOrder);
}

export async function deleteAuctionImage(
  auctionId: string,
  imageId: string,
  sellerId: string,
) {
  const auction = await verifyAuctionOwnership(auctionId, sellerId);

  if (!auction) {
    return undefined;
  }

  const [image] = await db
    .select()
    .from(auctionImages)
    .where(
      and(
        eq(auctionImages.id, imageId),
        eq(auctionImages.auctionId, auctionId),
      ),
    );

  if (!image) {
    return undefined;
  }

  if (image.publicId) {
    await deleteCloudinaryImage(image.publicId);
  }

  await db.delete(auctionImages).where(eq(auctionImages.id, imageId));

  return image;
}
