"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import type { Session, Workshop } from "@/lib/types"
import { getSession, getSessionWorkshop } from "@/lib/session-storage"

export default function SessionScreenPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)

  useEffect(() => {
    const loadSession = () => {
      const loadedSession = getSession(sessionId)
      if (!loadedSession) {
        router.push("/")
        return
      }
      setSession(loadedSession)

      const loadedWorkshop = getSessionWorkshop(sessionId)
      if (loadedWorkshop) {
        setWorkshop(loadedWorkshop)
      }
    }

    loadSession()

    // Poll for updates every 2 seconds
    const interval = setInterval(loadSession, 2000)
    return () => clearInterval(interval)
  }, [sessionId, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (!session || !workshop) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <p className="text-white/60 text-2xl">Loading...</p>
      </div>
    )
  }

  const currentBlock = workshop.blocks.find((b) => b.id === session.currentBlockId)

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12">
      {/* Timer */}
      <div className="text-center mb-16">
        <div className="text-[12rem] font-bold text-white leading-none tracking-tight mb-4">
          {formatTime(session.elapsedTime)}
        </div>
        <div className="text-3xl text-white/60">Session Time</div>
      </div>

      {/* Current Activity */}
      {currentBlock && (
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-2 rounded-full bg-primary/20 text-primary text-xl font-semibold mb-6">
              {currentBlock.type}
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 text-balance">{currentBlock.title}</h1>
            <p className="text-2xl text-white/60">{currentBlock.duration} minutes</p>
          </div>

          {currentBlock.type === "discussion" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border-2 border-white/20">
              <p className="text-4xl text-white text-center leading-relaxed text-balance">{currentBlock.prompt}</p>
            </div>
          )}

          {currentBlock.type === "survey" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border-2 border-white/20">
              <div className="text-center space-y-6">
                <p className="text-4xl text-white font-semibold">Please complete the survey</p>
                {currentBlock.subscales.map((subscale) => (
                  <div key={subscale.id} className="pt-6 border-t border-white/20">
                    <p className="text-3xl text-white/90">{subscale.title}</p>
                    <p className="text-xl text-white/60 mt-2">{subscale.questions.length} questions</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentBlock.type === "break" && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border-2 border-white/20">
              <p className="text-5xl text-white text-center font-semibold">Break Time</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
