import type { ComponentPropsWithoutRef } from "react"

type DivProps = ComponentPropsWithoutRef<"div">

export function ScrollArea({ className = "", ...props }: DivProps) {
  return <div className={`overflow-y-auto ${className}`} {...props} />
}
