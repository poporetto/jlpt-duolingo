import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://poporetto.github.io/jlpt-duolingo/'),
  title: 'Kuma JLPT — Memorable Japanese learning',
  description: 'Interactive JLPT N1–N5 grammar, kanji, vocabulary and listening practice with Kuma, your study bear.',
  icons: {
    icon: 'https://poporetto.github.io/jlpt-duolingo/irasutoya-study-bear.png',
    apple: 'https://poporetto.github.io/jlpt-duolingo/irasutoya-study-bear.png',
  },
  openGraph: {
    title: 'Kuma JLPT — N1 to N5 Japanese practice',
    description: 'Small steps. Real Japanese. Interactive JLPT practice with Kuma.',
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'Kuma JLPT — N1 to N5. Small steps. Real Japanese.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kuma JLPT — N1 to N5 Japanese practice',
    description: 'Small steps. Real Japanese. Interactive JLPT practice with Kuma.',
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
