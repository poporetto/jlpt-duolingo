import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'Kuma N2 — Memorable JLPT learning',
  description: 'Interactive JLPT N2 grammar, kanji, vocabulary and listening practice with Kuma, your study bear.',
  icons: { icon: '/irasutoya-study-bear.png', apple: '/irasutoya-study-bear.png' },
  openGraph: {
    title: 'Kuma N2 — Memorable JLPT learning',
    description: 'Small steps. Real Japanese. Interactive N2 practice with Kuma.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Kuma N2 — Small steps. Real Japanese.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuma N2 — Memorable JLPT learning',
    description: 'Small steps. Real Japanese. Interactive N2 practice with Kuma.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
