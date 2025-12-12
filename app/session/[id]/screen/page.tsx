"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Session, Workshop, Block } from "@/lib/types"
import { getSession, getSessionWorkshop } from "@/lib/session-storage"
import { Button } from "@/components/ui/button"
import { QRCode } from "@/components/common/qr-code"

export default function SessionScreenPage() {
  const p = useParams()
  const id = p.id as string
  const [session, setSession] = useState<Session | null>(null)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)

  // Poll and listen for updates
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

  if (!session || !workshop) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-muted-foreground">Loading…</div>
    )
  }

  const currentBlock: Block | undefined = workshop.blocks.find((b) => b.id === session.currentBlockId)
  const seconds = currentBlock ? (session.timers?.[currentBlock.id] || 0) : 0
  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">{workshop.title || "Workshop"}</h1>
            <p className="text-sm text-muted-foreground">Projector View</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Join at join.workshop</div>
            <div className="text-2xl font-semibold tracking-widest">{session.joinCode}</div>
          </div>
        </div>

        {/* Timer */}
        <div className="rounded-xl border bg-card p-10 mb-8 text-center">
          <div className="text-9xl font-bold font-mono tabular-nums">
            {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
          </div>
          <div className="text-sm text-muted-foreground mt-2">Time Elapsed (Block)</div>
        </div>

        {/* Join Link + QR */}
        <div className="rounded-xl border bg-card p-8 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {session.joinCode && (
              <div className="flex items-center justify-center w-32 h-32 rounded-lg bg-secondary/50">
                <QRCode value={`/join?code=${session.joinCode}`} size={112} />
              </div>
            )}
            <div>
              <div className="text-xs text-muted-foreground">Join at</div>
              <div className="text-lg font-semibold">join.workshop</div>
              <div className="text-sm mt-1">
                Code: <span className="font-mono font-semibold tracking-widest">{session.joinCode}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`/join?code=${session.joinCode}`, "_blank")}
            >
              Open Join Link
            </Button>
          </div>
        </div>

        {/* Current Activity */}
        {currentBlock && (
          <div className="rounded-xl border bg-card p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Current Activity</div>
                <div className="text-2xl font-semibold">{currentBlock.title}</div>
              </div>
              <div className="px-2 py-1 text-xs rounded bg-accent/20 text-accent capitalize">{currentBlock.type}</div>
            </div>
            {currentBlock.type === "discussion" ? (
              <div className="p-6 rounded-lg bg-secondary/30 text-lg leading-relaxed">
                {currentBlock.prompt || "Awaiting instructions…"}
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-secondary/30 text-lg leading-relaxed">
                Please follow facilitator instructions and complete the survey on your device.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
