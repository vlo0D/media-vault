import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Media Vault',
  description: 'Direct-to-S3 image uploads with a minimal interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

