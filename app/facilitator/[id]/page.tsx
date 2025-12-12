"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

import { GlobalNav } from "@/components/facilitator-os/global-nav"
import { AgendaSidebar } from "@/components/facilitator-os/agenda-sidebar"
import { DesignCanvas } from "@/components/facilitator-os/design-canvas"
import { RunCanvas } from "@/components/facilitator-os/run-canvas"

import type { AppMode, Block, Participant, Workshop } from "@/lib/types"
import { mockParticipants } from "@/lib/mock-data"
import { startSessionRecord, completeSessionRecord, updateSessionRecord } from "@/lib/session-history"
import { createSession, getSession } from "@/lib/session-storage"
import { getDraft, saveDraft, deleteDraft } from "@/lib/draft-storage"
import { getWorkshop, saveWorkshop } from "@/lib/workshop-storage"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
// Session storage not used for navigation anymore; unified run UI lives here

export default function FacilitatorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const workshopId = params.id as string
  const searchParams = useSearchParams()

  const [mode, setMode] = useState<AppMode>("DESIGN")
  const [workshopTitle, setWorkshopTitle] = useState("")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState<string | null>(null)
  const [historyRecordId, setHistoryRecordId] = useState<string | null>(null)

  // Participants for Run mode
  const participants: Participant[] = useMemo(() => mockParticipants, [])

  // Load workshop (draft -> saved). Do not auto-seed activities.
  useEffect(() => {
    const fromSaved = getWorkshop(workshopId)
    const fromDraft = getDraft(workshopId)
    // Prefer saved (published) over draft so library opens the latest
    const source = fromSaved || fromDraft

    const initial: Workshop =
      source || {
        id: workshopId,
        title: "Untitled Workshop",
        blocks: [],
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

    setWorkshopTitle(initial.title)
    setBlocks(initial.blocks)
    setActiveBlockId(initial.blocks[0]?.id || null)
  }, [workshopId])

  // If query sets mode=run, open Run view initially
  useEffect(() => {
    const m = searchParams.get("mode")?.toLowerCase()
    if (m === "run") setMode("RUN")
    const blockId = searchParams.get("block")
    if (blockId) {
      setActiveBlockId(blockId)
    }
  }, [searchParams])

  // Start/complete session records when entering/leaving Run mode
  useEffect(() => {
    const workshop: Workshop = {
      id: workshopId,
      title: workshopTitle,
      blocks,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (mode === "RUN" && !activeSessionId) {
      // Create a real (mock) session for sync and projector
      const s = createSession(workshop)
      if (activeBlockId) {
        // ensure current block is set for projector
        import("@/lib/session-storage").then(({ updateSession }) => {
          updateSession(s.id, { currentBlockId: activeBlockId })
        })
      }
      setActiveSessionId(s.id)
      setJoinCode(s.joinCode || null)
      // Also record to archive (history)
      const rec = startSessionRecord(workshop, activeBlockId)
      setHistoryRecordId(rec.id)
    }
    if (mode === "DESIGN" && activeSessionId) {
      if (historyRecordId) completeSessionRecord(historyRecordId)
      setActiveSessionId(null)
      setJoinCode(null)
      setHistoryRecordId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // Update current block in history record while running
  useEffect(() => {
    if (historyRecordId) {
      updateSessionRecord(historyRecordId, { currentBlockId: activeBlockId || null })
    }
  }, [activeBlockId, historyRecordId])

  // Complete session if user closes tab while running
  useEffect(() => {
    const handler = () => {
      if (historyRecordId) completeSessionRecord(historyRecordId)
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [historyRecordId])

  // Persist draft changes locally (in-memory) for quick editing
  useEffect(() => {
    const draft: Workshop = {
      id: workshopId,
      title: workshopTitle,
      blocks,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveDraft(draft)
  }, [workshopId, workshopTitle, blocks])

  const activeBlock = blocks.find((b) => b.id === activeBlockId)

  const handleBlockUpdate = (block: Block) => {
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)))
  }

  const handlePublish = () => {
    const toSave: Workshop = {
      id: workshopId,
      title: workshopTitle,
      blocks,
      status: "upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    try {
      saveWorkshop(toSave)
      deleteDraft(workshopId)
      toast({ title: "Workshop published", description: "Saved to your library." })
      router.push("/library")
    } catch (e) {
      toast({
        title: "Publish failed",
        description: "Could not save to local storage.",
      })
    }
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Far Left Rail */}
      <GlobalNav activeSection="home" />

      {/* Main 2-column: Agenda + Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Agenda */}
        <AgendaSidebar
          blocks={blocks}
          activeBlockId={activeBlockId}
          onBlockSelect={setActiveBlockId}
          onAddBlock={(type) => {
            const id = `block-${Date.now()}`
            if (type === "survey") {
              const newBlock: Block = {
                id,
                type: "survey",
                title: "New Survey",
                duration: 10,
                subscales: [
                  {
                    id: `subscale-${Date.now()}`,
                    title: "Block 1",
                    questions: [],
                  },
                ],
              }
              setBlocks((prev) => [...prev, newBlock])
              setActiveBlockId(id)
              setMode("DESIGN")
              toast({ title: "Survey added", description: "A new survey was appended to the agenda." })
            } else {
              const newBlock: Block = {
                id,
                type: "discussion",
                title: "New Discussion",
                duration: 10,
                prompt: "",
                groupingMethod: "random",
                hasReflection: false,
              }
              setBlocks((prev) => [...prev, newBlock])
              setActiveBlockId(id)
              setMode("DESIGN")
              toast({ title: "Discussion added", description: "A new discussion was appended to the agenda." })
            }
          }}
          onRemoveBlock={(id) => {
            setBlocks((prev) => {
              const remaining = prev.filter((b) => b.id !== id)
              if (activeBlockId === id) {
                setActiveBlockId(remaining[0]?.id || null)
              }
              return remaining
            })
            toast({ title: "Removed", description: "The block was removed from the agenda." })
          }}
        />

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mode: <span className="font-medium text-foreground">{mode}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={mode === "DESIGN" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("DESIGN")}
              >
                Design
              </Button>
              <Button
                variant={mode === "RUN" ? "default" : "outline"}
                size="sm"
                onClick={() => setMode("RUN")}
              >
                Run Session
              </Button>
              <div className="w-px h-6 bg-border" />
              <Button size="sm" onClick={handlePublish}>Publish</Button>
              {mode === "RUN" && activeSessionId && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/session/${activeSessionId}/screen`, "_blank")}
                  >
                    Projector View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/join?code=${joinCode || ""}`, "_blank")}
                  >
                    Join Code {joinCode || "—"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {mode === "DESIGN" ? (
            <DesignCanvas
              workshopTitle={workshopTitle}
              onTitleChange={setWorkshopTitle}
              activeBlock={activeBlock}
              onBlockUpdate={handleBlockUpdate as (b: Block) => void}
              onModeChange={() => setMode("RUN")}
            />
          ) : (
            <RunCanvas
              activeBlock={activeBlock}
              participants={participants}
              onModeChange={() => setMode("DESIGN")}
              sessionId={activeSessionId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
