import type { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-gray-100">
      <AppSidebar />
      <main className="flex flex-col flex-1 min-w-0 bg-white">
        {children}
      </main>
    </SidebarProvider>
  )
}
