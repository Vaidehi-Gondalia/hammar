'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAuction, uploadAuctionImages } from '@/lib/api';
import Image from 'next/image';

export default function CreateAuctionPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length > 10) {
      event.target.value = '';
      setError('You can upload a maximum of 10 images');
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024,
    );

    if (invalidFile) {
      setError('Each image must be an image file smaller than 5MB');
      return;
    }

    setError('');
    setImages(selectedFiles);
  }

  function handleRemoveImage(index: number) {
    setImages((currentImages) =>
      currentImages.filter((_, imageIndex) => imageIndex !== index),
    );
  }

  function validateForm(): string | null {
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedCategory = category.trim();

    if (trimmedTitle.length < 3) {
      return 'Auction title must be at least 3 characters';
    }

    if (trimmedTitle.length > 200) {
      return 'Auction title cannot exceed 200 characters';
    }

    if (trimmedDescription.length < 10) {
      return 'Description must be at least 10 characters';
    }

    if (trimmedDescription.length > 5000) {
      return 'Description cannot exceed 5000 characters';
    }

    if (trimmedCategory.length < 2) {
      return 'Category must be at least 2 characters';
    }

    if (trimmedCategory.length > 100) {
      return 'Category cannot exceed 100 characters';
    }

    const startingPriceNumber = Number(startingPrice);

    if (
      !startingPrice ||
      !Number.isInteger(startingPriceNumber) ||
      startingPriceNumber <= 0
    ) {
      return 'Starting price must be a positive whole number';
    }

    if (reservePrice) {
      const reservePriceNumber = Number(reservePrice);

      if (!Number.isInteger(reservePriceNumber) || reservePriceNumber <= 0) {
        return 'Reserve price must be a positive whole number';
      }

      if (reservePriceNumber < startingPriceNumber) {
        return 'Reserve price must be greater than or equal to starting price';
      }
    }

    if (!startTime) {
      return 'Start time is required';
    }

    if (!endTime) {
      return 'End time is required';
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (Number.isNaN(startDate.getTime())) {
      return 'Invalid start time';
    }

    if (Number.isNaN(endDate.getTime())) {
      return 'Invalid end time';
    }

    if (endDate <= startDate) {
      return 'End time must be after start time';
    }

    if (images.length > 10) {
      return 'You can upload a maximum of 10 images';
    }

    const invalidImage = images.find(
      (file) => !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024,
    );

    if (invalidImage) {
      return 'Each image must be an image file smaller than 5MB';
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const auction = await createAuction({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        startingPrice: Number(startingPrice),
        ...(reservePrice ? { reservePrice: Number(reservePrice) } : {}),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      if (images.length > 0) {
        await uploadAuctionImages(auction.auction.id, images);
      }

      router.push(`/auctions/${auction.auction.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFAFA]">
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-sm font-semibold text-[#000080] hover:underline"
          >
            ← Back
          </button>

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6D8196]">
            Seller
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-[#000080]">
            Create Auction
          </h1>

          <p className="mt-3 text-[#6D8196]">
            Create a new auction and make your product available to buyers.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-[#6D8196]/20 bg-white p-6 shadow-lg sm:p-8"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-bold text-[#000080]"
            >
              Auction Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={3}
              maxLength={200}
              required
              placeholder="Enter auction title"
              className="w-full rounded-xl border border-[#6D8196]/30 px-4 py-3 outline-none transition focus:border-[#000080]"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-bold text-[#000080]"
            >
              Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={10}
              maxLength={5000}
              required
              rows={6}
              placeholder="Describe your product..."
              className="w-full resize-none rounded-xl border border-[#6D8196]/30 px-4 py-3 outline-none transition focus:border-[#000080]"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-bold text-[#000080]"
            >
              Category
            </label>

            <input
              id="category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              minLength={2}
              maxLength={100}
              required
              placeholder="e.g. Electronics, Furniture, Collectibles"
              className="w-full rounded-xl border border-[#6D8196]/30 px-4 py-3 outline-none transition focus:border-[#000080]"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startingPrice"
                className="mb-2 block text-sm font-bold text-[#000080]"
              >
                Starting Price
              </label>

              <input
                id="startingPrice"
                type="number"
                min="1"
                step="1"
                value={startingPrice}
                onChange={(event) => setStartingPrice(event.target.value)}
                required
                placeholder="1000"
                className="w-full rounded-xl border border-[#6D8196]/30 px-4 py-3 outline-none transition focus:border-[#000080]"
              />
            </div>

            <div>
              <label
                htmlFor="reservePrice"
                className="mb-2 block text-sm font-bold text-[#000080]"
              >
                Reserve Price
                <span className="ml-1 font-normal text-[#6D8196]">
                  (Optional)
                </span>
              </label>

              <input
                id="reservePrice"
                type="number"
                min="1"
                step="1"
                value={reservePrice}
                onChange={(event) => setReservePrice(event.target.value)}
                placeholder="5000"
                className="w-full rounded-xl border border-[#6D8196]/30 px-4 py-3 outline-none transition focus:border-[#000080]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="images"
              className="mb-2 block text-sm font-bold text-[#000080]"
            >
              Auction Images
            </label>

            <input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full rounded-xl border border-[#6D8196]/30 px-4 py-3 text-sm"
            />

            <p className="mt-2 text-xs text-[#6D8196]">
              Upload up to 10 images. Each image must be smaller than 5MB.
            </p>

            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${image.lastModified}`}
                    className="relative w-40 overflow-hidden rounded-xl border border-[#6D8196]/20 bg-[#EBF3F8] shadow-sm sm:w-44"
                  >
                    <div className="relative aspect-square w-full">
                      <Image
                        src={URL.createObjectURL(image)}
                        alt={image.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold leading-none text-white shadow-md transition hover:bg-red-700"
                        aria-label={`Remove ${image.name}`}
                      >
                        ×
                      </button>
                    </div>

                    <p className="truncate px-3 py-2 text-xs text-[#6D8196]">
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startTime"
                className="mb-2 block text-sm font-bold text-[#000080]"
              >
                Start Time
              </label>

              <input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                required
                className="w-full rounded-xl border border-[#6D8196]/30 px-4 py-3 outline-none transition focus:border-[#000080]"
              />
            </div>

            <div>
              <label
                htmlFor="endTime"
                className="mb-2 block text-sm font-bold text-[#000080]"
              >
                End Time
              </label>

              <input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                required
                className="w-full rounded-xl border border-[#6D8196]/30 px-4 py-3 outline-none transition focus:border-[#000080]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#000080] px-6 py-3.5 text-sm font-bold text-[#FFFAFA] transition hover:bg-[#000080]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating Auction...' : 'Create Auction'}
          </button>
        </form>
      </main>
    </div>
  );
}
