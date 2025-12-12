"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import type { Block, DiscussionBlock, SurveyBlock } from "@/lib/types"
import { DiscussionEditor } from "@/components/workshop/discussion-editor"
import { SurveyEditor } from "@/components/workshop/survey-editor"

interface DesignCanvasProps {
  workshopTitle: string
  onTitleChange: (title: string) => void
  activeBlock: Block | undefined
  onBlockUpdate: (block: Block) => void
  onModeChange: () => void
}

export function DesignCanvas({
  workshopTitle,
  onTitleChange,
  activeBlock,
  onBlockUpdate,
  onModeChange,
}: DesignCanvasProps) {
  if (!activeBlock) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a block from the agenda to edit</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <Input
          value={workshopTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 max-w-2xl"
        />
        <Button onClick={onModeChange} size="lg" className="gap-2">
          <Play className="w-4 h-4" />
          Run Session
        </Button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {activeBlock.type === "discussion" && (
            <DiscussionEditor block={activeBlock as DiscussionBlock} onUpdate={onBlockUpdate} />
          )}
          {activeBlock.type === "survey" && (
            <SurveyEditor block={activeBlock as SurveyBlock} onUpdate={onBlockUpdate} />
          )}
        </div>
      </div>
    </div>
  )
}
