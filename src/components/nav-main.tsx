"use client"

import { modules } from "@/config/modules"
import { useAuth } from "@/hooks/useAuth"
import { Link, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export function NavMain() {
  const { role } = useAuth()
  const location = useLocation()
  const allowedModules = modules.filter((m) =>
    m.allowedRoles.includes(role as any)
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegación</SidebarGroupLabel>
      <SidebarMenu>
        {allowedModules.map((item) => (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={location.pathname === item.path}
            >
              <Link to={item.path} className="flex items-center gap-2">
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
