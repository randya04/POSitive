"use client"

import * as React from "react"
import { Link, useNavigate } from "react-router-dom"

import { modules, type Role } from "@/config/modules"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "./ui/drawer"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { role, loading } = useAuth()
  const effectiveRole = (role ?? "super_admin") as Role
  const allowedModules = modules.filter((m) => m.allowedRoles.includes(effectiveRole))

  const onOpenChange = React.useCallback(
    (open: boolean) => setOpen(open),
    []
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-full gap-4 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="!size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9h16.5m-16.5 6.75h16.5"
            />
          </svg>
          <span className="sr-only">Toggle Menu</span>
          <span className="flex h-8 flex-1 items-center justify-between rounded-md border bg-muted/50 px-2 text-sm font-normal text-muted-foreground shadow-none">
            Menú
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[80svh] p-0">
        <div className="overflow-auto p-6">
          <div className="flex flex-col space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                ))
              : allowedModules.map((item) => (
                  <MobileLink
                    key={item.path}
                    to={item.path}
                    onOpenChange={setOpen}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon && <item.icon className="size-5" />}
                      {item.title}
                    </span>
                  </MobileLink>
                ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface MobileLinkProps {
  to: string
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  to,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const navigate = useNavigate()
  return (
    <Link
      to={to}
      onClick={() => {
        navigate(to)
        onOpenChange?.(false)
      }}
      className={"text-[1.15rem]" + (className ? ` ${className}` : "")}
      {...props}
    >
      {children}
    </Link>
  )
}
