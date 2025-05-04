import type { ReactNode } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import styles from '@/pages/Dashboard.module.css'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className={styles.container}>
        <AppSidebar />
        <div className={styles.main}>{children}</div>
      </div>
    </SidebarProvider>
  )
}
