"use client"

import { Home, Library, Archive, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GlobalNavProps {
  activeSection?: string
}

export function GlobalNav({ activeSection = "home" }: GlobalNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "library", icon: Library, label: "Library" },
    { id: "archive", icon: Archive, label: "Archive" },
    { id: "settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="w-16 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-4 gap-2">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="icon"
          className={cn(
            "w-12 h-12 text-sidebar-foreground hover:bg-sidebar-accent",
            activeSection === item.id && "bg-sidebar-accent text-sidebar-primary",
          )}
          title={item.label}
        >
          <item.icon className="w-5 h-5" />
        </Button>
      ))}
    </div>
  )
}
