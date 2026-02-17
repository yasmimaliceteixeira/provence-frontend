"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(node)
      } else if (ref != null && typeof ref === "object") {
        try {
          ;(ref as React.MutableRefObject<T | null>).current = node
        } catch {
          // readonly, ignora
        }
      }
    }
  }
}

const TooltipContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  delayDuration: number
}>({
  open: false,
  setOpen: () => {},
  delayDuration: 0,
})

const TooltipProvider = ({
  children,
  delayDuration = 300,
}: {
  children: React.ReactNode
  delayDuration?: number
}) => {
  const [open, setOpen] = React.useState(false)
  return (
    <TooltipContext.Provider value={{ open, setOpen, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  )
}

const Tooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ asChild, children, ...props }, ref) => {
  const { setOpen, delayDuration } = React.useContext(TooltipContext)
  const childRef = React.useRef<HTMLElement>(null)
  const mergedRef = mergeRefs<HTMLElement>(childRef, ref)

  const child = asChild ? React.Children.only(children) : <span {...props}>{children}</span>

  if (!React.isValidElement(child)) {
    return <span ref={mergedRef}>{children}</span>
  }

  const typedChild = child as React.ReactElement<any>

  return React.cloneElement(typedChild, {
    ...props,
    ref: mergedRef,
    onMouseEnter: (e: React.MouseEvent) => {
      typedChild.props.onMouseEnter?.(e)
      const timer = setTimeout(() => setOpen(true), delayDuration)
      return () => clearTimeout(timer)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      typedChild.props.onMouseLeave?.(e)
      setOpen(false)
    },
    onFocus: (e: React.FocusEvent) => {
      typedChild.props.onFocus?.(e)
      setOpen(true)
    },
    onBlur: (e: React.FocusEvent) => {
      typedChild.props.onBlur?.(e)
      setOpen(false)
    },
  })
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: "top" | "right" | "bottom" | "left"
    align?: "start" | "center" | "end"
    sideOffset?: number
    hidden?: boolean
  }
>(
  (
    {
      className,
      children,
      side = "top",
      align = "center",
      sideOffset = 4,
      hidden = false,
      ...props
    },
    ref
  ) => {
    const { open } = React.useContext(TooltipContext)

    if (hidden || !open) {
      return null
    }

    return (
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        data-side={side}
        data-align={align}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          transform: "translateY(-100%)",
          marginTop: `-${sideOffset}px`,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
