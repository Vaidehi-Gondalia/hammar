import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';

export default function SellerPage() {
  return (
    <div className="min-h-screen bg-[#FFFAFA]">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#6D8196]">
              Seller Marketplace
            </p>

            <h1 className="text-5xl font-black tracking-tight text-[#000080] sm:text-6xl">
              Sell. Auction. Earn.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6D8196]">
              Create auctions, manage your products, and connect with bidders on
              HAMMR.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/auctions/create"
                className="rounded-xl bg-[#000080] px-6 py-3.5 text-sm font-bold text-[#FFFAFA] transition hover:bg-[#000080]/90"
              >
                Create Auction
              </Link>

              <Link
                href="/auctions"
                className="rounded-xl border border-[#000080] px-6 py-3.5 text-sm font-bold text-[#000080] transition hover:bg-[#ADD8E6]/30"
              >
                My Auctions
              </Link>
            </div>
          </div>
        </section>

        {/* Seller Features */}
        <section className="border-t border-[#6D8196]/20 bg-[#ADD8E6]/10 px-6 py-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href="/auctions/create"
                className="rounded-2xl border border-[#6D8196]/20 bg-[#FFFAFA] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-[#000080]">
                  Create Auction
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6D8196]">
                  List your product and start an auction for potential buyers.
                </p>
              </Link>

              <Link
                href="/auctions"
                className="rounded-2xl border border-[#6D8196]/20 bg-[#FFFAFA] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-[#000080]">
                  Manage Auctions
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6D8196]">
                  View, update, and manage your existing auctions.
                </p>
              </Link>

              <Link
                href="/profile"
                className="rounded-2xl border border-[#6D8196]/20 bg-[#FFFAFA] p-6 transition hover:-translate-y-1 hover:shadow-md"
              >
                <h2 className="text-lg font-bold text-[#000080]">
                  Seller Profile
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6D8196]">
                  Manage your account and seller profile information.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
