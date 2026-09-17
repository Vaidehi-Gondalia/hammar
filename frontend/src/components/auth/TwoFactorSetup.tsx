'use client';

import { useState } from 'react';
import { setupTwoFactor, verifyTwoFactor } from '@/lib/api';
import Image from 'next/image';

type TwoFactorSetupProps = {
  onEnabled?: () => void;
};

export default function TwoFactorSetup({ onEnabled }: TwoFactorSetupProps) {
  const [otpUri, setOtpUri] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await setupTwoFactor();

      setOtpUri(data.otpUri);
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setMessage(
        '2FA setup started. Scan the QR code with your authenticator app.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await verifyTwoFactor(code);

      setMessage('Two-factor authentication enabled successfully.');

      setCode('');
      onEnabled?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid authentication code',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#000080]">
          Two-Factor Authentication
        </h2>

        <p className="mt-1 text-sm text-[#6D8196]">
          Add an extra layer of security to your HAMMR account.
        </p>
      </div>

      {!otpUri && (
        <button
          type="button"
          onClick={handleSetup}
          disabled={loading}
          className="rounded-xl bg-[#000080] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Enable 2FA'}
        </button>
      )}

      {otpUri && (
        <div className="space-y-4">
          {qrCodeDataUrl && (
            <div className="flex justify-center">
              <Image
                src={qrCodeDataUrl}
                alt="Scan this QR code with your authenticator app"
                width={224}
                height={224}
                className="h-56 w-56 rounded-xl border border-gray-200 p-2"
              />
            </div>
          )}
          <div className="rounded-xl border border-[#6D8196]/20 bg-[#FFFAFA] p-4">
            <p className="text-sm text-[#6D8196]">
              Your authenticator setup URI:
            </p>

            <p className="mt-2 break-all text-xs text-gray-700">{otpUri}</p>
          </div>

          <div>
            <label
              htmlFor="two-factor-code"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Authentication Code
            </label>

            <input
              id="two-factor-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#000080]"
            />
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            className="rounded-xl bg-[#000080] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
          </button>
        </div>
      )}

      {message && (
        <p className="text-sm font-medium text-green-600">{message}</p>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
