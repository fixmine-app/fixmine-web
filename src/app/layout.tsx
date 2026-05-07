import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FixMine — AI PC Problem Solver',
  description: 'AI yang mendiagnosa dan memperbaiki masalah PC dalam detik. Gratis 3x per bulan.',
  keywords: 'PC repair, fix computer, blue screen, slow PC, AI, Bahasa Indonesia',
  openGraph: {
    title: 'FixMine — AI PC Problem Solver',
    description: 'AI yang benerin PC kamu dalam detik. Gratis.',
    url: 'https://fixmine.app',
    siteName: 'FixMine',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512 }],
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#00d4ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  )
}
