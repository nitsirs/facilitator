"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import type { Session, Workshop, Block, DiscussionBlock, SurveyBlock } from "@/lib/types"
import { getSession, updateSession, getSessionWorkshop } from "@/lib/session-storage"
import { Button } from "@/components/ui/button"
import { DiscussionView } from "@/components/participant/discussion-view"
import { SurveyView } from "@/components/participant/survey-view"
import { getResponses, saveResponses, type ParticipantResponses } from "@/lib/participant-responses"

export default function ParticipantPage() {
  const p = useParams()
  const id = p.id as string
  const sp = useSearchParams()
  const [session, setSession] = useState<Session | null>(null)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [responses, setResponses] = useState<ParticipantResponses>({})
  const [reflection, setReflection] = useState("")
  const name = sp.get("name") || "Guest"
  const pid = sp.get("pid") || "guest"

  // Subscribe to updates
  useEffect(() => {
    const load = () => {
      setSession(getSession(id))
      setWorkshop(getSessionWorkshop(id))
      if (pid) setResponses(getResponses(id, pid))
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
    // Persist responses
    if (pid) saveResponses(session.id, pid, responses)
    alert("Marked as finished!")
  }

  const updateResponse = (qid: string, value: string | number | string[]) => {
    setResponses((prev) => {
      const next = { ...prev, [qid]: value }
      if (pid) saveResponses(id, pid, next)
      return next
    })
  }

  // Mark thinking while typing; provide Help and Done buttons
  useEffect(() => {
    if (!session || !pid) return
    const participants = (session.participants || []).map((p) =>
      p.id === pid ? { ...p, name, status: "thinking" } : p,
    )
    updateSession(session.id, { participants })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responses])

  const markHelp = () => {
    if (!session || !pid) return
    const participants = (session.participants || []).map((p) =>
      p.id === pid ? { ...p, name, status: "help-needed" } : p,
    )
    updateSession(session.id, { participants })
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
          <DiscussionView
            block={currentBlock as DiscussionBlock}
            reflection={reflection}
            onReflectionChange={setReflection}
          />
        )}

        {currentBlock && currentBlock.type === "survey" && (
          <SurveyView
            block={currentBlock as SurveyBlock}
            responses={responses}
            onChange={updateResponse}
          />
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={markHelp}>
            Need Help
          </Button>
          <Button className="flex-1" onClick={markFinished}>
            I'm Done
          </Button>
        </div>
      </div>
    </div>
  )
}
