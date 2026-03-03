// Create the missing useIsMobile hook as a separate file
"use client"

import * as React from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verify initially
    checkIsMobile()

    // Add listener for resize
    window.addEventListener("resize", checkIsMobile)

    // Clean up listener
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}
