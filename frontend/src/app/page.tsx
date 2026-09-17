import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFFAFA]">
      {/* Public Navbar */}
      <nav className="border-b border-[#6D8196]/20 bg-[#FFFAFA]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* HAMMR Logo */}
          <Link
            href="/"
            className="text-2xl font-black tracking-tight text-[#000080]"
          >
            HAMMR
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#000080] transition hover:bg-[#ADD8E6]/30"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-[#000080] px-5 py-2.5 text-sm font-bold text-[#FFFAFA] transition hover:bg-[#000080]/90"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Welcome Section */}
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#6D8196]">
            Live Auction Marketplace
          </p>

          <h1 className="text-5xl font-black tracking-tight text-[#000080] sm:text-6xl">
            Welcome to HAMMR
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6D8196]">
            Discover unique products, participate in live auctions, and
            experience real-time bidding on HAMMR.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-[#000080] px-6 py-3.5 text-sm font-bold text-[#FFFAFA] transition hover:bg-[#000080]/90"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-[#000080] px-6 py-3.5 text-sm font-bold text-[#000080] transition hover:bg-[#ADD8E6]/30"
            >
              Create Account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
