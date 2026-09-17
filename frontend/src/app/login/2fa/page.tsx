'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, verifyTwoFactorLogin } from '@/lib/api';

export default function LoginTwoFactorPage() {
  const router = useRouter();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleVerify() {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter a valid 6-digit authentication code.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await verifyTwoFactorLogin(code);

      const user = await getMyProfile();

      if (user.role === 'seller') {
        router.push('/seller');
      } else {
        router.push('/buyer');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Two-factor authentication failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAFA] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#6D8196]/20 bg-white p-8 shadow-2xl shadow-[#6D8196]/20 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-[#000080]">
            Two-Factor Authentication
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#6D8196]">
            Enter the 6-digit code from your authenticator app to complete
            login.
          </p>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-700">
              <span className="font-semibold">Error: </span>
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="two-factor-code"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#000080]"
            >
              Authentication Code
            </label>

            <input
              id="two-factor-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, ''))
              }
              placeholder="000000"
              className="w-full rounded-xl border border-[#6D8196]/30 bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.4em] text-slate-900 shadow-sm focus:border-[#000080] focus:outline-none focus:ring-2 focus:ring-[#ADD8E6]"
            />
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="flex w-full items-center justify-center rounded-xl bg-[#000080] py-3.5 text-sm font-bold tracking-wide text-[#FFFAFA] shadow-lg shadow-[#000080]/25 transition-all hover:bg-[#000080]/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/login')}
            className="w-full text-sm font-semibold text-[#6D8196] hover:text-[#000080]"
          >
            Back to Login
          </button>
        </div>
      </div>
    </main>
  );
}
