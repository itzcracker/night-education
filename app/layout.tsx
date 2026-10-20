import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Nightfall — play in the dark', description: 'A premium browser for games, ideas, and after-hours discovery.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#070a14', userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
