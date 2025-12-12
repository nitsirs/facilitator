"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Session, Workshop, Block } from "@/lib/types"
import { getSession, getSessionWorkshop } from "@/lib/session-storage"

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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white/70">
        Loading…
      </div>
    )
  }

  const currentBlock: Block | undefined = workshop.blocks.find((b) => b.id === session.currentBlockId)
  const seconds = currentBlock ? (session.timers?.[currentBlock.id] || 0) : 0
  const m = Math.floor(seconds / 60)
  const s = seconds % 60

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 text-center">
      <div className="text-[10rem] font-bold text-white tabular-nums leading-none">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </div>
      <div className="text-2xl text-white/70 mt-4">Time Remaining</div>

      {currentBlock && (
        <div className="mt-12 w-full max-w-5xl">
          <div className="mb-8">
            <div className="inline-block px-5 py-2 rounded-full bg-primary/20 text-primary text-xl font-semibold mb-4 capitalize">
              {currentBlock.type}
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">{currentBlock.title}</h1>
          </div>

          {currentBlock.type === "discussion" ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border-2 border-white/20">
              <p className="text-3xl text-white leading-relaxed">{currentBlock.prompt || "Awaiting instructions…"}</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border-2 border-white/20">
              <p className="text-3xl text-white">Please follow facilitator instructions and complete the survey on your device</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-14 text-white/80">
        Join at <span className="font-semibold">join.workshop</span> and enter code
        <span className="ml-2 text-3xl font-bold tracking-widest">{session.joinCode}</span>
      </div>
    </div>
  )
}
