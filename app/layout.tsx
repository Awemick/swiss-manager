import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Navigation } from '@/components/layout/navigation'
import { SocketProvider } from '@/lib/socket-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chess Tournament Manager',
  description: 'Professional chess tournament management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SocketProvider>
            <div className="min-h-screen bg-background">
              <Navigation />
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </SocketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}