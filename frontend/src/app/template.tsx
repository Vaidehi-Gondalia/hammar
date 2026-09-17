'use client';

import { useEffect, useState } from 'react';

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#FFFAFA]">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-3xl font-black tracking-tight text-[#000080]">
              HAMMR
            </h1>

            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ADD8E6] border-t-[#000080]" />

            <p className="text-sm font-semibold text-[#6D8196]">Loading...</p>
          </div>
        </div>
      )}

      {children}
    </>
  );
}
