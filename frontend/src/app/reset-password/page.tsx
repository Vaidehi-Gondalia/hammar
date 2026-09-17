import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

function ResetPasswordContent() {
  return (
    <div className="w-full max-w-[440px] rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-300/50 sm:p-10">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-[#000080] sm:text-3xl">
          Reset Password
        </h1>

        <p className="mt-2 text-xs text-slate-500 sm:text-sm">
          Create a new password for your HAMMR account.
        </p>
      </div>

      <ResetPasswordForm />

      <div className="mt-6 text-center">
        <a
          href="/login"
          className="text-xs font-semibold text-[#000080] transition hover:underline"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EBF3F8] px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-[440px] rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl shadow-slate-300/50 sm:p-10">
            <p className="text-center text-sm text-slate-500">Loading...</p>
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}
