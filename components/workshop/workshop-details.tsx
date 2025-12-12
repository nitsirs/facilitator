"use client"

import { SurveyEditor } from "./survey-editor"
import { DiscussionEditor } from "./discussion-editor"
import type { Block, EditorView } from "@/lib/types"

interface WorkshopDetailsProps {
  activeBlock: Block | undefined
  activeView: EditorView
  onBlockUpdate: (block: Block) => void
  onViewChange: (view: EditorView) => void
}

export function WorkshopDetails({ activeBlock, activeView, onBlockUpdate, onViewChange }: WorkshopDetailsProps) {
  if (!activeBlock) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">No Activity Selected</h3>
          <p className="text-muted-foreground">Select or create an activity from the agenda</p>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 overflow-auto bg-background">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Details</h2>
          <p className="text-muted-foreground">Configure your {activeBlock.type} activity</p>
        </div>

        {activeBlock.type === "survey" && activeView === "survey" && (
          <SurveyEditor block={activeBlock} onUpdate={onBlockUpdate} />
        )}

        {activeBlock.type === "discussion" && activeView === "discussion" && (
          <DiscussionEditor block={activeBlock} onUpdate={onBlockUpdate} />
        )}
      </div>
    </main>
  )
}
