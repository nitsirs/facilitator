"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import type { Session, Workshop, Block } from "@/lib/types"
import { getSession, updateSession, getSessionWorkshop } from "@/lib/session-storage"
import { Button } from "@/components/ui/button"

export default function ParticipantPage() {
  const p = useParams()
  const id = p.id as string
  const sp = useSearchParams()
  const [session, setSession] = useState<Session | null>(null)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const name = sp.get("name") || "Guest"
  const pid = sp.get("pid") || "guest"

  // Subscribe to updates
  useEffect(() => {
    const load = () => {
      setSession(getSession(id))
      setWorkshop(getSessionWorkshop(id))
    }
    load()
    const t = setInterval(load, 1000)
    const onStorage = () => load()
    window.addEventListener("storage", onStorage)
    return () => {
      clearInterval(t)
      window.removeEventListener("storage", onStorage)
    }
  }, [id])

  const currentBlock: Block | undefined = useMemo(
    () => workshop?.blocks.find((b) => b.id === session?.currentBlockId),
    [workshop, session],
  )

  const seconds = currentBlock ? (session?.timers?.[currentBlock.id] || 0) : 0
  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  const markFinished = () => {
    if (!session) return
    // Update mock participant status in session (if participant exists)
    const participants = (session.participants || []).map((p) =>
      p.id === pid ? { ...p, name, status: "finished" } : p,
    )
    updateSession(session.id, { participants })
    setSession({ ...session, participants })
    alert("Marked as finished!")
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Participant</h1>
          <div className="font-mono text-sm">
            {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </div>
        </div>

        {currentBlock && currentBlock.type === "discussion" && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Discussion Prompt</div>
            <div className="p-4 rounded-lg border bg-card">{currentBlock.prompt || "No prompt"}</div>
          </div>
        )}

        {currentBlock && currentBlock.type === "survey" && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Survey</div>
            <div className="p-4 rounded-lg border bg-card">
              Follow facilitator instructions. (Questions UI can be added later.)
            </div>
          </div>
        )}

        <Button className="w-full" onClick={markFinished}>
          I'm Done
        </Button>
      </div>
    </div>
  )
}
