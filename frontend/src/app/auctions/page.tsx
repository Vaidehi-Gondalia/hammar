'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyAuctions } from '@/lib/api';

type Auction = {
  id: string;
  title: string;
  description: string;
  category: string;
  startingPrice: string | number;
  reservePrice: string | number;
  currentHighestBid: string | number | null;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'live' | 'closed' | 'cancelled';
};

export default function AuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAuctions() {
      try {
        const data = await getMyAuctions();
        setAuctions(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load auctions',
        );
      } finally {
        setLoading(false);
      }
    }

    loadAuctions();
  }, []);

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  // Status Badge Helper
  const getStatusBadge = (status: Auction['status']) => {
    switch (status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Scheduled
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Closed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 ring-1 ring-inset ring-rose-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Skeleton Loader
  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="h-10 w-28 rounded-xl bg-slate-200" />
          <div className="space-y-2">
            <div className="h-8 w-60 rounded-lg bg-slate-200" />
            <div className="h-4 w-72 rounded bg-slate-200" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
              >
                <div className="flex justify-between">
                  <div className="h-4 w-20 rounded bg-slate-200" />
                  <div className="h-6 w-16 rounded-full bg-slate-200" />
                </div>
                <div className="h-6 w-3/4 rounded bg-slate-200" />
                <div className="h-16 rounded-2xl bg-slate-100" />
                <div className="h-4 w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // Error State
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-xl shadow-rose-100/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
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
            Failed to Load Auctions
          </h3>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#000080] px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#000066]"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Navigation & Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="group mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#000080] shadow-sm transition hover:border-[#000080] hover:bg-slate-50"
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
              Back
            </button>
            <h1 className="text-2xl font-black tracking-tight text-[#000080] sm:text-3xl">
              My Auctions
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Oversee and manage your listed catalog, bids, and auction
              timelines.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>
              {auctions.length} {auctions.length === 1 ? 'Auction' : 'Auctions'}{' '}
              Total
            </span>
          </div>
        </div>

        {/* Empty State */}
        {auctions.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-800">
              No auctions found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              You haven&apos;t listed any auctions yet. Start by creating a lot
              to open bidding.
            </p>{' '}
          </div>
        ) : (
          /* Auctions Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auction) => (
              <Link
                key={auction.id}
                href={`/auctions/${auction.id}`}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div>
                  {/* Category & Status Row */}
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      {auction.category}
                    </span>
                    {getStatusBadge(auction.status)}
                  </div>

                  {/* Auction Title */}
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#000080] transition-colors line-clamp-1">
                    {auction.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                    {auction.description}
                  </p>

                  {/* Price Metrics Container */}
                  <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Highest Bid
                      </span>
                      <span className="text-sm font-black text-[#000080]">
                        {auction.currentHighestBid !== null
                          ? `₹${Number(auction.currentHighestBid).toLocaleString('en-IN')}`
                          : 'No bids yet'}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200/60" />
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Starting Price</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(auction.startingPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Reserve Price</span>
                      <span className="font-semibold text-slate-800">
                        ₹{Number(auction.reservePrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline & Action Footer */}
                <div className="mt-5 border-t border-slate-100 pt-4 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Starts:
                    </span>
                    <span className="font-medium text-slate-700">
                      {new Date(auction.startTime).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Ends:
                    </span>
                    <span className="font-medium text-slate-700">
                      {new Date(auction.endTime).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end text-xs font-bold text-[#000080] group-hover:translate-x-0.5 transition-transform">
                    <span>Manage Lot</span>
                    <svg
                      className="ml-1 h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
