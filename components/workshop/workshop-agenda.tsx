"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Plus, FileText, MessageSquare, Coffee, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Block } from "@/lib/types"
import { useRouter } from "next/navigation"
import { createSession } from "@/lib/session-storage"

interface WorkshopAgendaProps {
  blocks: Block[]
  activeBlockId: string | null
  onBlockSelect: (id: string) => void
  onAddBlock: (type: "survey" | "discussion") => void
  workshopId: string
}

export function WorkshopAgenda({ blocks, activeBlockId, onBlockSelect, onAddBlock, workshopId }: WorkshopAgendaProps) {
  const router = useRouter()

  const getBlockIcon = (type: Block["type"]) => {
    switch (type) {
      case "survey":
        return FileText
      case "discussion":
        return MessageSquare
      case "break":
        return Coffee
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  // Calculate cumulative times
  let cumulativeTime = 0
  const blocksWithTime = blocks.map((block) => {
    const start = cumulativeTime
    cumulativeTime += block.duration
    return { ...block, startTime: start, endTime: cumulativeTime }
  })

  const handlePlayBlock = (e: React.MouseEvent, blockId: string) => {
    e.stopPropagation()

    // Get workshop from storage
    const workshop = {
      id: workshopId,
      title: "Workshop",
      blocks,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Create session and set current block
    const session = createSession(workshop)
    session.currentBlockId = blockId

    // Navigate to session dashboard
    router.push(`/session/${session.id}/dashboard`)
  }

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-1">Agenda</h2>
        <p className="text-sm text-muted-foreground">Total: {formatTime(cumulativeTime)}</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {blocksWithTime.map((block) => {
            const Icon = getBlockIcon(block.type)
            const isActive = block.id === activeBlockId

            return (
              <div key={block.id} className="relative group">
                <button
                  onClick={() => onBlockSelect(block.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-all",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:border-primary/50 hover:bg-accent/50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={cn("h-5 w-5 mt-0.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <h3 className={cn("font-medium text-sm mb-1", isActive ? "text-primary" : "text-foreground")}>
                        {block.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(block.startTime)} - {formatTime(block.endTime)} ({formatTime(block.duration)})
                      </p>
                    </div>
                  </div>
                </button>
                <Button
                  size="icon"
                  variant="default"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={(e) => handlePlayBlock(e, block.id)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-2">
        <Button onClick={() => onAddBlock("survey")} variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          Add Survey
        </Button>
        <Button onClick={() => onAddBlock("discussion")} variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          Add Discussion
        </Button>
      </div>
    </aside>
  )
}
