"use client"

import React from "react"

interface QRCodeProps {
  value: string
  size?: number // px
  className?: string
}

// Lightweight QR: uses a hosted generator to render a real, scannable QR.
// Can be swapped later with an in-app SVG generator.
export function QRCode({ value, size = 160, className }: QRCodeProps) {
  const [resolved, setResolved] = React.useState(value)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // If a relative path is passed, prefix with current origin on client
    if (value.startsWith("/") && typeof window !== "undefined") {
      setResolved(window.location.origin + value)
    } else {
      setResolved(value)
    }
  }, [value])

  if (!mounted) return null

  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(resolved)}`
  return <img src={src} alt="QR code" width={size} height={size} className={className} />
}
