'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteAuctionImage, getAuctionImages } from '@/lib/api';
import Image from 'next/image';

type AuctionImage = {
  id: string;
  auctionId: string;
  imageUrl: string;
  publicId: string | null;
  sortOrder: number;
  createdAt: string;
};

export default function AuctionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [auctionId, setAuctionId] = useState('');
  const [images, setImages] = useState<AuctionImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAuction() {
      try {
        const { id } = await params;

        setAuctionId(id);

        const auctionImages = await getAuctionImages(id);

        setImages(auctionImages);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load auction images',
        );
      } finally {
        setLoading(false);
      }
    }

    loadAuction();
  }, [params]);

  async function handleDeleteImage(imageId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this image?',
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteAuctionImage(auctionId, imageId);

      setImages((currentImages) =>
        currentImages.filter((image) => image.id !== imageId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  }

  // Modern Skeleton Loading Screen
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
          <div className="h-6 w-36 rounded-lg bg-slate-200" />
          <div className="space-y-3">
            <div className="h-8 w-64 rounded-lg bg-slate-200" />
            <div className="h-4 w-48 rounded bg-slate-200" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3"
              >
                <div className="aspect-square w-full rounded-xl bg-slate-200" />
                <div className="mt-4 flex justify-between">
                  <div className="h-4 w-20 rounded bg-slate-200" />
                  <div className="h-6 w-16 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error Banner State
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg shadow-rose-100/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
          <div className="mt-6">
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center rounded-xl bg-[#000080] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#000066]"
            >
              Back to Auctions
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* ================= TOP NAVIGATION / BACK BUTTON ================= */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <Link
            href="/auctions"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#000080] shadow-sm transition hover:border-[#000080] hover:bg-slate-50"
          >
            <svg
              className="h-4 w-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Auctions
          </Link>

          {/* Quick Item Count Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {images.length} {images.length === 1 ? 'Image' : 'Images'} Active
            </span>
          </div>
        </div>

        {/* ================= HEADER TITLE & METADATA ================= */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6D8196]">
            <span>Catalog Management</span>
            <span>•</span>
            <span className="text-slate-400">Media Assets</span>
          </div>

          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-[#000080] sm:text-3xl lg:text-4xl">
            Auction Media Gallery
          </h1>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Lot Reference ID:</span>
            <code className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono font-medium text-slate-700">
              {auctionId}
            </code>
          </div>
        </div>

        {/* ================= GALLERY CONTENT ================= */}
        {images.length === 0 ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">
              No media attached
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              This auction listing does not have any product images attached
              yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
              >
                {/* Image Container with native img to avoid hostname config hurdles */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-900/5">
                  <Image
                    src={image.imageUrl}
                    alt={`Auction asset #${image.sortOrder + 1}`}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    unoptimized
                  />

                  {/* Sort Order Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      #{image.sortOrder + 1}
                      {index === 0 && (
                        <span className="text-amber-300 font-semibold">
                          • Main
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Fullscreen External View link */}
                  <a
                    href={image.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/60 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-slate-900"
                    title="Open full resolution"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>

                {/* Card Action Footer */}
                <div className="mt-3 flex items-center justify-between gap-3 pt-1">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800">
                      Asset Slot #{image.sortOrder + 1}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      {new Date(image.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  {/* Danger Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 active:bg-rose-200"
                    title="Delete asset"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
