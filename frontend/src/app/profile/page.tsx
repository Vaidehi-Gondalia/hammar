'use client';

import ProfileForm from '@/components/profile/ProfileForm';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen w-full bg-[#EBF3F8] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#000080] hover:underline"
        >
          ← Back
        </button>
        {/* Page Header Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#000080]">
              Account Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your HAMMR account identity, credentials, and live
              participation status.
            </p>
          </div>
        </div>

        {/* Profile Interactive Form Component */}
        <ProfileForm />
      </div>
    </main>
  );
}
