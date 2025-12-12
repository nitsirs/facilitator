"use client"

import { GripVertical, MessageSquare, ClipboardList, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/types"

interface AgendaSidebarProps {
  blocks: Block[]
  activeBlockId: string | null
  onBlockSelect: (blockId: string) => void
}

export function AgendaSidebar({ blocks, activeBlockId, onBlockSelect }: AgendaSidebarProps) {
  const totalMinutes = blocks.reduce((sum, block) => sum + block.duration, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  const getBlockIcon = (type: Block["type"]) => {
    switch (type) {
      case "discussion":
        return MessageSquare
      case "survey":
        return ClipboardList
      case "break":
        return Coffee
    }
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-card-foreground">Workshop Agenda</h2>
        <p className="text-sm text-muted-foreground mt-1">Total Time: {totalTime}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {blocks.map((block) => {
          const Icon = getBlockIcon(block.type)
          const isActive = block.id === activeBlockId

          return (
            <button
              key={block.id}
              onClick={() => onBlockSelect(block.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                "hover:bg-secondary/50",
                isActive && "bg-primary/10 border-2 border-primary",
              )}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0",
                  isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-card-foreground">{block.title}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground flex-shrink-0">
                {block.duration}m
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
