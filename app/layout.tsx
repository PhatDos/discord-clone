import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'
import { ModalProvider } from '@/components/providers/modal-provider'
import { SocketProvider } from '@/components/providers/socket-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/toaster'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Chat app',
  description: 'An real-time chat application'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={cn(
            geistSans.variable,
            geistMono.variable,
            'bg-white dark:bg-[#313338] text-black dark:text-white'
          )}
        >
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            enableSystem
            storageKey='discord-clone-theme'
          >
            <QueryProvider>
              <SocketProvider>
                <ModalProvider />
                {children}
                <Toaster />
              </SocketProvider>
            </QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
