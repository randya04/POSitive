import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileNav } from '@/components/mobile-nav'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden md:block fixed inset-y-0 left-0 z-40 w-64">
        <AppSidebar />
      </div>
      <div className="flex flex-col flex-1 min-h-screen md:ml-64">
        <div className="md:hidden p-4 border-b border-border bg-background">
          <MobileNav />
        </div>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
