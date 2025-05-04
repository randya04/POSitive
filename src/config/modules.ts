import type { LucideIcon } from "lucide-react"
import { PieChart, User } from "lucide-react"

export type Role = "super_admin" | "restaurant_admin" | "host"

export interface Module {
  title: string
  path: string
  icon: LucideIcon
  allowedRoles: Role[]
}

export const modules: Module[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: PieChart,
    allowedRoles: ["super_admin", "restaurant_admin", "host"],
  },
  {
    title: "Usuarios",
    path: "/users",
    icon: User,
    allowedRoles: ["super_admin"],
  },
]
