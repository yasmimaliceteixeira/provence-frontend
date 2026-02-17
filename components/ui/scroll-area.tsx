import * as React from "react"
import { cn } from "@/lib/utils"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn(
        "overflow-auto scrollbar-thin scrollbar-thumb-provence-lightPurple scrollbar-track-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
