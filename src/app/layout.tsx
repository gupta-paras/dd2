import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Desi Dutch | Authentic Indian Cuisines with a Western Touch',
  description:
    'Experience the vibrant spectrum of all Indian regional cuisines—from royal Awadhi kormas, rich Punjabi makhani, and fragrant South Indian dishes to coastal curries—crafted with an artisanal Western culinary touch.',
  keywords: [
    'Desi Dutch',
    'Indian Food Amsterdam',
    'Pan Indian Cuisine',
    'Indian Western Fusion',
    'North Indian Curries',
    'South Indian Food',
    'Street Food Amsterdam',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#1C1917] selection:bg-amber-100 selection:text-amber-900">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
