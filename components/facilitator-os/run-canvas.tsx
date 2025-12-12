"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Plus, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Block, Participant, Session } from "@/lib/types"
import { getSession, updateSession } from "@/lib/session-storage"
import { QRCode } from "@/components/common/qr-code"

interface RunCanvasProps {
  activeBlock: Block | undefined
  blocks?: Block[]
  participants: Participant[]
  onModeChange: () => void
  sessionId?: string | null
  overrideRunningBlockId?: string | null
  overrideIsRunning?: boolean
}

export function RunCanvas({
  activeBlock,
  blocks = [],
  participants,
  onModeChange,
  sessionId,
  overrideRunningBlockId,
  overrideIsRunning,
}: RunCanvasProps) {
  const [session, setSession] = useState<Session | null>(null)

  // Load session and subscribe to changes
  useEffect(() => {
    if (!sessionId) return
    const s = getSession(sessionId)
    setSession(s)
    const onStorage = () => {
      const cur = getSession(sessionId)
      if (cur) setSession(cur)
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [sessionId])

  // Do not sync selected block to running session automatically.
  // Switching selection should not change the running activity.

  // Increment per-block timer when running (use overrides for immediacy)
  useEffect(() => {
    const effectiveRunningId = overrideRunningBlockId ?? session?.currentBlockId
    const effectiveIsRunning = overrideIsRunning ?? !!session?.isRunning
    if (!sessionId || !effectiveIsRunning || !effectiveRunningId) return
    const t = setInterval(() => {
      const cur = getSession(sessionId)
      if (!cur) return
      const timers = { ...(cur.timers || {}) }
      timers[effectiveRunningId] = (timers[effectiveRunningId] || 0) + 1
      updateSession(cur.id, { timers })
      setSession({ ...cur, timers })
    }, 1000)
    return () => clearInterval(t)
  }, [sessionId, overrideRunningBlockId, overrideIsRunning, session?.currentBlockId, session?.isRunning])

  const runningId = overrideRunningBlockId ?? session?.currentBlockId
  const isRunning = overrideIsRunning ?? !!session?.isRunning
  const runningBlock = runningId ? blocks.find((b) => b.id === runningId) : undefined
  const selectedBlock = activeBlock
  const elapsed = runningBlock && session ? session.timers?.[runningBlock.id] || 0 : 0
  const remaining = runningBlock ? Math.max(0, runningBlock.duration * 60 - elapsed) : 0
  const minutes = Math.floor(remaining / 60)
  const secondsR = remaining % 60

  if (!selectedBlock) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a block to run</p>
      </div>
    )
  }

  const prompt = selectedBlock.type === "discussion" ? selectedBlock.prompt : `Complete the ${selectedBlock.title} survey`

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header with small total timer and Exit */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-card-foreground">Live Session</h2>
          <div className="text-sm text-muted-foreground font-mono">
            Total: {
              (() => {
                const total = Object.values(session?.timers || {}).reduce((a, b) => a + (b || 0), 0)
                const m = Math.floor(total / 60)
                const s = total % 60
                return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
              })()
            }
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onModeChange} className="gap-2">
          <X className="w-4 h-4" />
          Exit Run Mode
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex gap-6">
        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Live Status - Current Prompt */}
          <Card className="bg-card">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Current Activity
                  </h3>
                  <p className="text-2xl font-semibold mt-1 text-card-foreground">{selectedBlock.title}</p>
                </div>
                <div className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  Live Sync
                </div>
              </div>
              {/* No running info here; controls and state live in the sidebar */}
              <div className="mt-6 p-6 bg-secondary/30 rounded-lg">
                <p className="text-3xl leading-relaxed text-card-foreground">{prompt}</p>
              </div>
              {/* Controls are per-block in the sidebar. Kept read-only here to avoid confusion. */}
            </CardContent>
          </Card>

          {/* Participant Grid */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Participants ({participants.length})
              </h3>
              <div className="grid grid-cols-6 gap-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex flex-col items-center gap-2">
                    <div className="relative">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-sm font-medium",
                          "ring-4",
                          participant.status === "finished" && "ring-accent",
                          participant.status === "thinking" && "ring-muted",
                          participant.status === "help-needed" && "ring-destructive",
                        )}
                      >
                        {participant.name.charAt(0)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground text-center truncate w-full">
                      {participant.name.split(" ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projector Preview - Floating Card */}
        <Card className="w-80 h-fit bg-card sticky top-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Projector View</h3>
            </div>
            <div className="aspect-video bg-secondary/50 rounded-lg flex flex-col items-center justify-center gap-4 p-4">
              {session?.joinCode ? <QRCode value={`/join?code=${session.joinCode}`} size={120} /> : null}
              <div className="text-center">
                <p className="text-4xl font-bold font-mono">
                  {String(minutes).padStart(2, "0")}:{String(secondsR).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Join at join.workshop • Code {session?.joinCode}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1"
                  onClick={() => window.open(`/join?code=${session?.joinCode || ""}`, "_blank")}
                >
                  <ExternalLink className="w-3 h-3" /> Open Join Link
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
