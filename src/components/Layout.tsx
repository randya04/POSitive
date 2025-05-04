import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileMenu } from '@/components/ui/mobile-menu'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full md:pl-64">
      <AppSidebar />
      <div className="flex flex-col min-h-screen">
        <div className="md:hidden p-4 border-b border-border bg-background">
          <MobileMenu />
        </div>
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
