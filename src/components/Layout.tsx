import type { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileMenu } from '@/components/ui/mobile-menu'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="bg-gray-100">
      {/* Mobile menu (hamburger) */}
      <div className="md:hidden p-4 border-b border-border bg-background">
        <MobileMenu />
      </div>
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>
      <main className="flex flex-col flex-1 min-w-0 bg-background">
        {children}
      </main>
    </SidebarProvider>
  )
}
