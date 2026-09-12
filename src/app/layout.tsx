import type { Metadata } from 'next'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Quartermaster — Command Center',
  description: 'The operating system for your agency. All projects, all agents, one command center.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark', 'font-sans', geist.variable)}>
      <body>{children}</body>
    </html>
  )
}
