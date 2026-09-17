'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerFormSchema, type RegisterFormData } from '@/lib/auth.schema';
import Image from 'next/image';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    role: 'buyer',
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(field: keyof RegisterFormData, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setServerError('');
    setSuccessMessage('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrors({});
    setServerError('');
    setSuccessMessage('');

    const validation = registerFormSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};

      for (const issue of validation.error.issues) {
        const field = issue.path[0];

        if (
          typeof field === 'string' &&
          field in formData &&
          !fieldErrors[field as keyof RegisterFormData]
        ) {
          fieldErrors[field as keyof RegisterFormData] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }

    try {
      setIsLoading(true);

      const requestData = new FormData();

      requestData.append('name', validation.data.name);
      requestData.append('email', validation.data.email);
      requestData.append('password', validation.data.password);
      requestData.append('role', validation.data.role);

      if (validation.data.avatar) {
        requestData.append('avatar', validation.data.avatar);
      }

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        body: requestData,
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Registration successful! Redirecting...');

      setTimeout(() => {
        router.push('/register/2fa');
      }, 1000);
    } catch {
      setServerError('Unable to connect to the server. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full flex-col lg:grid lg:grid-cols-12 bg-[#FFFAFA]">
      {/* LEFT HALF (Full-bleed Hero: 7 cols on desktop to eliminate empty space) */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden lg:col-span-7 lg:flex p-12 xl:p-16">
        {/* Full Bleed Background Image with Deep Blue Overlay */}
        <Image
          src="https://images.unsplash.com/photo-1575505586569-646b2ca898fc?auto=format&fit=crop&w=1600&q=85"
          alt="Auction gavel and block"
          fill
          className="object-cover object-center"
        />

        {/* Color overlay using your palette (#000080 Navy to #6D8196 Slate) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000080]/95 via-[#000080]/70 to-[#000080]/40" />

        {/* Top Tag */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FFFAFA] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#ADD8E6] animate-pulse" />
            Live Marketplace
          </span>
        </div>

        {/* Bottom Headline over the photo */}
        <div className="relative z-10 max-w-xl space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#FFFAFA] sm:text-5xl">
            THE FINAL GAVEL.
          </h1>
          <p className="text-xl font-medium text-[#ADD8E6]">
            Bid, Sell, Discover premium lots in real time.
          </p>
          <p className="text-sm text-slate-200/80 leading-relaxed">
            Join collectors and verified sellers in an open, authentic bidding
            room built for speed and security.
          </p>
        </div>
      </section>

      {/* RIGHT HALF (Form Section: 5 cols on desktop, fills cleanly) */}
      <section className="flex flex-1 items-center justify-center bg-[#ADD8E6]/25 p-6 sm:p-10 lg:col-span-5 lg:min-h-screen">
        <div className="w-full max-w-md rounded-3xl border border-[#6D8196]/20 bg-[#FFFAFA] p-8 shadow-2xl shadow-[#6D8196]/20 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black tracking-tight text-[#000080] sm:text-3xl">
              Welcome to Action Hammer
            </h2>
            <p className="mt-2 text-sm text-[#6D8196]">
              Create your account to start bidding or selling today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server Error Alert */}
            {serverError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-700">
                <span className="font-semibold">Error: </span>
                {serverError}
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 text-sm text-emerald-700">
                <span className="font-semibold">Success! </span>
                {successMessage}
              </div>
            )}

            {/* Name Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-[#000080]"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={(event) => handleChange('name', event.target.value)}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder-[#6D8196]/50 shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-[#6D8196]/30 focus:border-[#000080] focus:ring-[#ADD8E6]'
                }`}
              />
              {errors.name && (
                <p className="text-xs font-medium text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#000080]"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="jane@email.com"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 placeholder-[#6D8196]/50 shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-[#6D8196]/30 focus:border-[#000080] focus:ring-[#ADD8E6]'
                }`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#000080]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(event) =>
                    handleChange('password', event.target.value)
                  }
                  className={`w-full rounded-xl border bg-white pl-4 pr-11 py-3 text-sm text-slate-900 placeholder-[#6D8196]/50 shadow-sm transition focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                      : 'border-[#6D8196]/30 focus:border-[#000080] focus:ring-[#ADD8E6]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    /* Eye Slash Icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                        clipRule="evenodd"
                      />
                      <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 014.168 5.67l2.557 2.557a4.004 4.004 0 004.023 5.703z" />
                    </svg>
                  ) : (
                    /* Eye Icon */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5"
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
            </div>

            {/* Role Field */}
            <div className="space-y-1.5">
              {/* Profile Image Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="avatar"
                  className="block text-xs font-bold uppercase tracking-wider text-[#000080]"
                >
                  Profile Image
                </label>

                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    setFormData((previous) => ({
                      ...previous,
                      avatar: file,
                    }));

                    setErrors((previous) => ({
                      ...previous,
                      avatar: undefined,
                    }));

                    setServerError('');
                    setSuccessMessage('');
                  }}
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[#6D8196]/30 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#ADD8E6]"
                />

                <p className="text-xs text-[#6D8196]">
                  Optional. Select an image from your device. Maximum size: 5
                  MB.
                </p>

                {errors.avatar && (
                  <p className="text-xs font-medium text-red-600">
                    {errors.avatar}
                  </p>
                )}
              </div>
              <label
                htmlFor="role"
                className="block text-xs font-bold uppercase tracking-wider text-[#000080]"
              >
                Participate As
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(event) => handleChange('role', event.target.value)}
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm transition focus:outline-none focus:ring-2 ${
                  errors.role
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                    : 'border-[#6D8196]/30 focus:border-[#000080] focus:ring-[#ADD8E6]'
                }`}
              >
                <option value="buyer">Bidder (Bid on items)</option>
                <option value="seller">Seller (List auction items)</option>
              </select>
              {errors.role && (
                <p className="text-xs font-medium text-red-600">
                  {errors.role}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center rounded-xl bg-[#000080] py-3.5 text-sm font-bold tracking-wide text-[#FFFAFA] shadow-lg shadow-[#000080]/25 transition-all hover:bg-[#000080]/90 hover:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000080] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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
                    {successMessage ? 'Redirecting...' : 'Creating account...'}
                  </span>
                ) : (
                  'Register'
                )}
              </button>
            </div>
          </form>
          {/* ================= ADD FROM HERE ================= */}
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#6D8196]/20"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#FFFAFA] px-3 font-semibold tracking-wider text-[#6D8196]">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Redirect to Login Button */}
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#6D8196]/30 bg-white py-3 text-sm font-bold text-[#000080] shadow-sm transition hover:bg-slate-50 hover:border-[#000080] active:bg-slate-100"
          >
            Sign In
            <svg
              className="h-4 w-4 text-[#6D8196] transition-transform group-hover:translate-x-0.5"
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
          </Link>
          {/* ================= END OF ADDITION ================= */}
        </div>
      </section>
    </main>
  );
}
