import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'nightfall',
  description: 'IXL | Math, Language Arts, Science, Social Studies, and Spanish',
  generator: '',
  icons: {
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%20%289%29-3jEQatgdHtQejKTQXkiHAM9xl80Qmq.png',
  },
}
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#070a14', userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
