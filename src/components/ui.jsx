import { forwardRef } from "react"
import { cva } from "class-variance-authority"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) { return twMerge(clsx(inputs)) }

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14532d] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#14532d] text-[#fdf8ee] hover:bg-[#1b4332] shadow-sm",
        clay: "bg-[#c96f4a] text-white hover:bg-[#b25e3c] shadow-sm",
        outline: "border border-[#14532d]/30 bg-white/70 text-[#14532d] hover:bg-[#dce8d8]/60",
        ghost: "text-[#14532d] hover:bg-[#dce8d8]/60",
        soft: "bg-[#dce8d8] text-[#14532d] hover:bg-[#c8dcbf]",
      },
      size: { sm: "h-9 px-4", md: "h-11 px-6", lg: "h-12 px-8 text-base" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

export const Button = forwardRef(function Button({ className, variant, size, ...props }, ref) {
  return <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
})

export function Card({ className, ...props }) {
  return <div className={cn("rounded-3xl border border-[#14532d]/10 bg-white card-shadow", className)} {...props} />
}

export function Badge({ className, tone = "sage", ...props }) {
  const tones = {
    sage: "bg-[#dce8d8] text-[#14532d]",
    clay: "bg-[#f3ddd2] text-[#8a3b1f]",
    gold: "bg-[#f7efdc] text-[#7a5a12] border border-[#e3cf8f]",
    forest: "bg-[#14532d] text-[#fdf8ee]",
    stone: "bg-stone-100 text-stone-700",
  }
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase", tones[tone], className)} {...props} />
}

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn("flex h-11 w-full rounded-2xl border border-[#14532d]/20 bg-white px-4 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#14532d]/40", className)} {...props} />
})

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn("flex w-full rounded-2xl border border-[#14532d]/20 bg-white px-4 py-3 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#14532d]/40", className)} {...props} />
})

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return <select ref={ref} className={cn("flex h-11 w-full rounded-2xl border border-[#14532d]/20 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]/40", className)} {...props}>{children}</select>
})

export function Label({ className, ...props }) {
  return <label className={cn("text-xs font-bold tracking-wide uppercase text-[#14532d]", className)} {...props} />
}
