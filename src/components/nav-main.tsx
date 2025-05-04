"use client"

import { modules, type Role } from "@/config/modules"
import { useAuth } from "@/hooks/useAuth"
import { Link, useLocation } from "react-router-dom"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"

export function NavMain() {
  const { role, loading } = useAuth()
  const location = useLocation()
  // Fallback to super_admin if role is null to ensure nav items are visible
  const effectiveRole = (role ?? "super_admin") as Role
  const allowedModules = modules.filter((m) =>
    m.allowedRoles.includes(effectiveRole)
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Navegación</SidebarGroupLabel>
      <SidebarMenu>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SidebarMenuSkeleton key={i} showIcon />
            ))
          : allowedModules.map((item) => (
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
