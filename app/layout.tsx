import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://poporetto.github.io/jlpt-duolingo/'),
  title: 'Kuma no Ryoku — The power of Japanese learning',
  description: 'Interactive JLPT N1–N5 practice powered by Kuma: grammar, kanji, vocabulary and listening.',
  icons: {
    icon: 'https://poporetto.github.io/jlpt-duolingo/irasutoya-study-bear.png',
    apple: 'https://poporetto.github.io/jlpt-duolingo/irasutoya-study-bear.png',
  },
  openGraph: {
    title: 'Kuma no Ryoku — 熊の力',
    description: 'Kuma’s power for your 日本語能力試験 journey. Interactive N1–N5 practice.',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Kuma no Ryoku — 熊の力。日本語の力。' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuma no Ryoku — 熊の力',
    description: 'Kuma’s power for your 日本語能力試験 journey. Interactive N1–N5 practice.',
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
      <body>{children}</body>
    </html>
  );
}
