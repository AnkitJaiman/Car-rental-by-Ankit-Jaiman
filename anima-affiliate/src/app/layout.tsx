import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Anima Jewels Partners', template: '%s · Anima Jewels Partners' },
  description: 'The Anima Jewels influencer and affiliate portal.',
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;600&family=Playfair+Display&display=swap" rel="stylesheet" />
      </head>
      <body>
        {process.env.NEXT_PUBLIC_TEST_MODE === 'true' && <div className="testbar">TEST MODE · data marked “Test” is sample data, not real orders or people</div>}
        {children}
      </body>
    </html>
  );
}
