import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal transition-all hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "!bg-[#7E3AF2] !dark:bg-[#7E3AF2] !text-white shadow-xs hover:!bg-[#7E3AF2]/90",
        destructive:
          "!bg-[oklch(0.97_0.02_26.7)] !border !border-[oklch(0.82_0.08_32.15)] text-black shadow-xs hover:!bg-[oklch(0.91_0.04_26.95)] hover:!border-[oklch(0.63_0.19_33.37)] focus-visible:ring-destructive/20 dark:!bg-[oklch(0.31_0.09_29.82)] dark:!border-[#cf222e] dark:text-white dark:hover:!bg-[oklch(0.63_0.19_33.37/0.5)] dark:focus-visible:ring-destructive/40 !dark:bg-[oklch(0.31_0.09_29.82)]/60",
        outline:
          "border border-border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<any,
  React.ComponentPropsWithoutRef<"button"> & { variant?: string; size?: string; asChild?: boolean }
>(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
