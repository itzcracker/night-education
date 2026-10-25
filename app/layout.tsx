import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'nightfall',
  description: 'IXL | Math, Language Arts, Science, Social Studies, and Spanish',
  generator: '',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/nightfall-high-resolution-logo%20%281%29-Ej3WMkEG8aPI24ozcBPWAKm789Ah0t.png',
  },
}
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#070a14', userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
