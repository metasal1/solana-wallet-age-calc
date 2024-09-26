import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Wallet Age Calculator",
  description: "Calculate the age of your Solana wallet",
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
  const deployDateTime = process.env.NEXT_PUBLIC_DEPLOY_DATE || 'Unknown';

  return (
    <html lang="en">
      <Analytics />
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        {children}
        <footer className="text-center py-4 text-xs text-gray-500">
          Deployed on: {deployDateTime} UTC
        </footer>
      </body>
    </html>
  );
}
