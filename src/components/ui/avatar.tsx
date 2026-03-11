import type { ComponentPropsWithoutRef } from "react"

type DivProps = ComponentPropsWithoutRef<"div">
type ImgProps = ComponentPropsWithoutRef<"img">

export function Avatar({ className = "", ...props }: DivProps) {
  return (
    <div
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
      {...props}
    />
  )
}

export function AvatarImage({ className = "", ...props }: ImgProps) {
  return <img className={`h-full w-full object-cover ${className}`} {...props} />
}

export function AvatarFallback({ className = "", ...props }: DivProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-muted text-xs font-semibold text-foreground ${className}`}
      {...props}
    />
  )
}
