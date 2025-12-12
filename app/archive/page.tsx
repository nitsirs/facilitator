"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { HomeSidebar } from "@/components/home/sidebar"
import { getSessionHistory, type SessionRecord } from "@/lib/session-history"
import { Calendar, Clock, Layers3 } from "lucide-react"

export default function ArchivePage() {
  const [history, setHistory] = useState<SessionRecord[]>([])

  useEffect(() => {
    setHistory(getSessionHistory())
  }, [])

  const formatDateTime = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—"

  const formatDuration = (sec?: number) => {
    if (!sec && sec !== 0) return "—"
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="h-screen flex bg-background text-foreground">
      <HomeSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Session History</h1>
            <p className="text-muted-foreground text-lg">Archive of completed and active sessions (mock)</p>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">No sessions yet. Start a session from a workshop.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {history.map((h) => (
                <Card key={h.id} className="p-5 bg-card border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{h.workshopTitle || "Untitled Workshop"}</h3>
                      <div className="text-xs mt-1">
                        <span className="px-2 py-1 rounded bg-muted text-muted-foreground capitalize">{h.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Started: {formatDateTime(h.startedAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Duration: {formatDuration(h.durationSec)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Layers3 className="h-4 w-4" /> Blocks: {h.blocksCount}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

