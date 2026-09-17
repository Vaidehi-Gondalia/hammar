'use client';

import { useRouter } from 'next/navigation';
import TwoFactorSetup from '@/components/auth/TwoFactorSetup';
import { getMyProfile } from '@/lib/api';

export default function RegisterTwoFactorPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAFA] px-6 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-[#6D8196]/20 bg-white p-8 shadow-2xl shadow-[#6D8196]/20 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-[#000080]">
            Secure Your Account
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#6D8196]">
            Two-factor authentication is required to complete your registration.
            Set it up using your authenticator app.
          </p>
        </div>

        <TwoFactorSetup
          onEnabled={async () => {
            const user = await getMyProfile();

            if (user.role === 'seller') {
              router.push('/seller');
            } else {
              router.push('/buyer');
            }
          }}
        />
      </div>
    </main>
  );
}
