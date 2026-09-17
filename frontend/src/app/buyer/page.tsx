import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function BuyerPage() {
  return (
    <div className="min-h-screen bg-[#FFFAFA]">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#6D8196]">
              Buyer Marketplace
            </p>

            <h1 className="text-5xl font-black tracking-tight text-[#000080] sm:text-6xl">
              Bid. Compete. Win.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6D8196]">
              Discover live auctions, place competitive bids, and find unique
              products on HAMMR.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auctions"
                className="rounded-xl bg-[#000080] px-6 py-3.5 text-sm font-bold text-[#FFFAFA] transition hover:bg-[#000080]/90"
              >
                Explore Auctions
              </Link>

              <Link
                href="/profile"
                className="rounded-xl border border-[#000080] px-6 py-3.5 text-sm font-bold text-[#000080] transition hover:bg-[#ADD8E6]/30"
              >
                My Profile
              </Link>
            </div>
          </div>
        </section>

        {/* Buyer Features */}
        <section className="border-t border-[#6D8196]/20 bg-[#ADD8E6]/10 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href="/auctions"
                className="rounded-2xl border border-[#6D8196]/20 bg-[#FFFAFA] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-[#000080]">
                  Live Auctions
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6D8196]">
                  Browse active auctions and participate in real-time bidding.
                </p>
              </Link>

              <Link
                href="/auctions"
                className="rounded-2xl border border-[#6D8196]/20 bg-[#FFFAFA] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-[#000080]">
                  Upcoming Auctions
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6D8196]">
                  Discover products that will be available for bidding soon.
                </p>
              </Link>

              <Link
                href="/profile"
                className="rounded-2xl border border-[#6D8196]/20 bg-[#FFFAFA] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-[#000080]">My Profile</h2>

                <p className="mt-2 text-sm leading-6 text-[#6D8196]">
                  Manage your account and personal information.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
