import type { Metadata } from 'next';
import './globals.css';
import { LoadingProvider } from '@/components/common/LoadingProvider';

export const metadata: Metadata = {
  title: 'Hammr',
  description: 'Hammr auction platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}
