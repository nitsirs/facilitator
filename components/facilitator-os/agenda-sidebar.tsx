"use client"

import { useState } from "react"
import * as ContextMenu from "@radix-ui/react-context-menu"
import { GripVertical, MessageSquare, ClipboardList, Coffee, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface AgendaSidebarProps {
  blocks: Block[]
  activeBlockId: string | null
  onBlockSelect: (blockId: string) => void
  onAddBlock?: (type: "survey" | "discussion") => void
  onRemoveBlock?: (blockId: string) => void
}

export function AgendaSidebar({ blocks, activeBlockId, onBlockSelect, onAddBlock, onRemoveBlock }: AgendaSidebarProps) {
  const totalMinutes = blocks.reduce((sum, block) => sum + block.duration, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const totalTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

  const [showAddMenu, setShowAddMenu] = useState(false)

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
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-semibold text-card-foreground">Workshop Agenda</h2>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Total Time: {totalTime}</p>
          {onAddBlock && (
            <div className="relative">
              <Button size="sm" className="gap-1" onClick={() => setShowAddMenu((s) => !s)}>
                <Plus className="w-4 h-4" />
                Add
              </Button>
              {showAddMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-card shadow-lg p-2 z-10">
                  <button
                    className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-secondary/50 text-sm"
                    onClick={() => {
                      onAddBlock("survey")
                      setShowAddMenu(false)
                    }}
                  >
                    <ClipboardList className="w-4 h-4" />
                    Add Survey
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-secondary/50 text-sm"
                    onClick={() => {
                      onAddBlock("discussion")
                      setShowAddMenu(false)
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Add Discussion
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {blocks.map((block) => {
          const Icon = getBlockIcon(block.type)
          const isActive = block.id === activeBlockId

          return (
            <ContextMenu.Root key={block.id}>
              <ContextMenu.Trigger asChild>
                <button
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
              </ContextMenu.Trigger>
              {onRemoveBlock && (
                <ContextMenu.Portal>
                  <ContextMenu.Content className="z-50 min-w-[160px] rounded-md border border-border bg-card p-1 shadow-lg">
                    <ContextMenu.Item
                      className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-secondary/50"
                      onSelect={(e) => {
                        e.preventDefault()
                        onRemoveBlock(block.id)
                      }}
                    >
                      Remove
                    </ContextMenu.Item>
                  </ContextMenu.Content>
                </ContextMenu.Portal>
              )}
            </ContextMenu.Root>
          )
        })}
      </div>
    </div>
  )
}
