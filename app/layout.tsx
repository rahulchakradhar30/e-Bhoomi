import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'e-Bhoomi | AI-Assisted Land Record Digitization',
    template: '%s | e-Bhoomi',
  },
  description: 'AI-assisted land record digitization and verification platform for structured, multilingual processing of legacy land documents, with human-in-the-loop validation and hierarchical administrative workflows.',
  keywords: ['e-Bhoomi', 'Land Records', 'Digitization', 'Government of India', 'Land Resources'],
  authors: [{ name: 'Department of Land Resources', url: 'https://dolr.gov.in/' }],
  creator: 'Government of India',
  publisher: 'Ministry of Rural Development',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/assets/e-bhoomi-logo.svg',
    shortcut: '/assets/e-bhoomi-logo.svg',
    apple: '/assets/e-bhoomi-logo.svg',
  },
  openGraph: {
    title: 'e-Bhoomi | AI-Assisted Land Record Digitization',
    description: 'AI-assisted land record digitization and verification platform for structured, multilingual processing of legacy land documents.',
    url: '/',
    siteName: 'e-Bhoomi',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'e-Bhoomi | AI-Assisted Land Record Digitization',
    description: 'AI-assisted land record digitization and verification platform.',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Display:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
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
