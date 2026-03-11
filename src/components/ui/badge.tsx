import type { ComponentPropsWithoutRef } from "react"

type SpanProps = ComponentPropsWithoutRef<"span">

export function Badge({ className = "", ...props }: SpanProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground ${className}`}
      {...props}
    />
  )
}
