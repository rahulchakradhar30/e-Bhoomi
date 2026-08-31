import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'e-Bhoomi • National Land Records Modernization System',
  description: 'Department of Land Resources, Ministry of Rural Development, Government of India',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <div className="ebhoomi-full-portal-layout">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
