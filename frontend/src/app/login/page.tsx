import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFAFA] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#6D8196]/20 bg-white p-8 shadow-2xl shadow-[#6D8196]/20 sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-[#000080]">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-[#6D8196]">
            Sign in to continue to HAMMR.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
