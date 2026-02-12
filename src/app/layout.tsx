import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

// Montserrat - Primary font for STE-SCPB
// Optimized for LCP with critical weights only
// Using 'swap' display ensures text is visible immediately with fallback font
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  display: 'swap',
  // Only load critical weights to reduce font file size
  // 400: body text, 600: subheadings, 700: headings
  weight: ['400', '600', '700'],
  preload: true,
  // Fallback fonts for better CLS (Cumulative Layout Shift)
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
  // Adjust font metrics to reduce layout shift
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  // Bing Webmaster Tools verification
  verification: {
    other: {
      'msvalidate.01': '229720A4CFEF3E14FF47DEA0D88E55CE',
    },
  },
};

/**
 * Root Layout
 * Required by Next.js 16 to have html/body tags
 * Language is set to 'fr' as default, locale layout handles i18n content
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2RP92153GZ" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2RP92153GZ');
            `,
          }}
        />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        {/* 
          Preconnect to Google Fonts for faster font loading
          This establishes early connections to reduce latency
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/*
          DNS prefetch as fallback for browsers that don't support preconnect
        */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body className={`${montserrat.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
