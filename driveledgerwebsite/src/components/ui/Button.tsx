import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import Link from "next/link"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm border border-white/20",
  {
    variants: {
      variant: {
        default:
          "bg-white/25 text-primary-foreground shadow-lg hover:bg-white/30 hover:shadow-xl hover:scale-[1.02] backdrop-blur-[4px]",
        destructive:
          "bg-destructive/80 text-destructive-foreground shadow-lg hover:bg-destructive/90 backdrop-blur-[4px]",
        outline:
          "border border-white/30 bg-white/10 shadow-lg hover:bg-white/20 hover:border-white/40 backdrop-blur-[4px]",
        secondary:
          "bg-white/20 text-secondary-foreground shadow-lg hover:bg-white/30 backdrop-blur-[4px]",
        ghost: "hover:bg-white/10 hover:text-accent-foreground backdrop-blur-[4px]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  href?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, href, ...props }, ref) => {
    if (href) {
      return (
        <Link
          href={href}
          className={cn(buttonVariants({ variant, size, className }))}
        >
          {props.children}
        </Link>
      )
    }

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 