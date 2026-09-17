'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginFormSchema, type LoginFormData } from '@/lib/auth.schema';
import { getMyProfile, API_URL } from '@/lib/api';

export default function LoginForm() {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginFormData, string>>
  >({});

  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof LoginFormData, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setServerError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setServerError('');

    const validation = loginFormSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (
          typeof field === 'string' &&
          field in formData &&
          !fieldErrors[field as keyof LoginFormData]
        ) {
          fieldErrors[field as keyof LoginFormData] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validation.data),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Login failed');
        return;
      }

      if (data.requiresTwoFactor) {
        router.push('/login/2fa');
        return;
      }

      const user = await getMyProfile();

      if (user.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/buyer');
      }
    } catch {
      setServerError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // fixed inset-0 ensures this view breaks free from any parent max-width container (like in app/login/layout.tsx)
    <div className="fixed inset-0 z-50 flex h-full w-full overflow-y-auto bg-[#EBF3F8]">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* ================= LEFT SIDE (Hero Image & Branding) ================= */}
        {/* ================= LEFT SIDE (Hero Image & Branding) ================= */}
        {/* ================= LEFT SIDE (Hero Image & Branding) ================= */}
        <div className="relative hidden w-full lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#0A1128] p-12 text-white xl:p-16">
          {/* Clear, Bright Wooden Gavel Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center brightness-110 contrast-110 opacity-80"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1676181739859-08330dea8999?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            }}
          />

          {/* Soft Navy Tint Overlay (Translucent so the wood and background highlights remain bright) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#020517]/90 via-[#0A1647]/50 to-blue-900/30" />

          {/* Top Tag */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3.5 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Live Marketplace
            </div>
          </div>

          {/* Bottom Headline & Description */}
          <div className="relative z-10 max-w-lg space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tight text-white drop-shadow-md xl:text-5xl">
              The Final Gavel.
            </h1>
            <p className="text-base font-semibold text-slate-100 drop-shadow-sm">
              Bid, Sell, Discover premium lots in real time.
            </p>
            <p className="text-xs text-slate-200/90 leading-relaxed drop-shadow-sm">
              Join collectors and verified sellers in an open, authentic bidding
              room built for speed and security.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE (Card Section) ================= */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-[440px] rounded-3xl bg-white p-8 sm:p-10 shadow-2xl shadow-slate-300/50 border border-slate-100">
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#000080]">
                Welcome Back
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                Sign in to manage your lots, track bids, and access the live
                room.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Server Error */}
              {serverError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-medium">
                  {serverError}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="jane@email.com"
                  value={formData.email}
                  onChange={(event) =>
                    handleChange('email', event.target.value)
                  }
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition ${
                    errors.email
                      ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[#000080] focus:ring-2 focus:ring-blue-100'
                  }`}
                />

                {errors.email && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(event) =>
                      handleChange('password', event.target.value)
                    }
                    className={`w-full rounded-xl border bg-white pl-4 pr-11 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition ${
                      errors.password
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                        : 'border-slate-200 focus:border-[#000080] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                          clipRule="evenodd"
                        />
                        <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 014.168 5.67l2.557 2.557a4.004 4.004 0 004.023 5.703z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path
                          fillRule="evenodd"
                          d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.password}
                  </p>
                )}

                <div className="text-right">
                  <a
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#000080] transition hover:underline"
                  >
                    Forgot Password?
                  </a>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#000080] py-3.5 text-sm font-bold text-white shadow-md shadow-[#000080]/20 transition-all hover:bg-[#000066] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold tracking-wider">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            {/* Redirect to Register Button */}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100"
            >
              Create an account
              <svg
                className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
