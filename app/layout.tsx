import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Wallet Age Calculator",
  description: "How old is your Solana wallet?",
  openGraph: {
    title: 'SolAge',
    siteName: 'solage.vercel.app',
    type: 'website',
    description: 'How old is your Solana wallet?',
    images: [
      {
        url: 'https://solage.vercel.app/api/og',
        width: 1200,
        height: 630,
        alt: 'SolAge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SolAge',
    description: 'How old is your Solana wallet?',
    images: ['https://solage.vercel.app/api/og'],
    creator: '@metasal_',
    site: 'https://solage.vercel.app',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
