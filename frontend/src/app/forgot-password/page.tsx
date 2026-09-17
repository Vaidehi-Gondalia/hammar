import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <main className="fixed inset-0 z-50 flex h-full w-full overflow-y-auto bg-[#EBF3F8]">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Side */}
        <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#0A1128] p-12 text-white lg:flex lg:w-1/2 xl:p-16">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-80 brightness-110 contrast-110"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1676181739859-08330dea8999?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fA%3D%3D')",
            }}
          />

          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#020517]/90 via-[#0A1647]/50 to-blue-900/30" />

          {/* Top Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3.5 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live Marketplace
            </div>
          </div>

          {/* Bottom Content */}
          <div className="relative z-10 max-w-lg space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-md xl:text-5xl">
              The Final Gavel.
            </h1>

            <p className="text-base font-semibold text-slate-100 drop-shadow-sm">
              Bid, Sell, Discover premium lots in real time.
            </p>

            <p className="text-xs leading-relaxed text-slate-200/90 drop-shadow-sm">
              Join collectors and verified sellers in an open, authentic bidding
              room built for speed and security.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2 lg:p-16">
          <div className="w-full max-w-[440px] rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-300/50 sm:p-10">
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl font-black tracking-tight text-[#000080] sm:text-3xl">
                Forgot Password?
              </h2>

              <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                Enter your email and we&apos;ll help you reset your password.
              </p>
            </div>

            <ForgotPasswordForm />

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <a
                href="/login"
                className="text-xs font-semibold text-[#000080] transition hover:underline"
              >
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
