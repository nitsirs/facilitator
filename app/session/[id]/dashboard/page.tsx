"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, SkipForward, Monitor, Home, Clock } from "lucide-react"
import type { Session, Workshop, Block } from "@/lib/types"
import { getSession, updateSession, getSessionWorkshop } from "@/lib/session-storage"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function SessionDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    const loadedSession = getSession(sessionId)
    if (!loadedSession) {
      router.push("/")
      return
    }
    setSession(loadedSession)
    setElapsedTime(loadedSession.elapsedTime)

    const loadedWorkshop = getSessionWorkshop(sessionId)
    if (loadedWorkshop) {
      setWorkshop(loadedWorkshop)
    }
  }, [sessionId, router])

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        const newTime = prev + 1
        if (session) {
          updateSession(session.id, { elapsedTime: newTime })
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, session])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (session) {
      updateSession(session.id, { status: isPlaying ? "paused" : "active" })
    }
  }

  const handleBlockClick = (block: Block) => {
    if (session) {
      updateSession(session.id, { currentBlockId: block.id })
      setSession({ ...session, currentBlockId: block.id })
    }
  }

  const handleNextBlock = () => {
    if (!workshop || !session) return
    const currentIndex = workshop.blocks.findIndex((b) => b.id === session.currentBlockId)
    if (currentIndex < workshop.blocks.length - 1) {
      const nextBlock = workshop.blocks[currentIndex + 1]
      handleBlockClick(nextBlock)
    }
  }

  if (!session || !workshop) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    )
  }

  const currentBlock = workshop.blocks.find((b) => b.id === session.currentBlockId)
  const currentBlockIndex = workshop.blocks.findIndex((b) => b.id === session.currentBlockId)

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{session.title}</h1>
              <p className="text-sm text-white/60">{workshop.title}</p>
            </div>
          </div>
          <Link href={`/session/${sessionId}/screen`} target="_blank">
            <Button variant="outline" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Monitor className="h-4 w-4" />
              Open Projector View
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Agenda Sidebar */}
        <aside className="w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm overflow-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Agenda</h2>
            <div className="space-y-2">
              {workshop.blocks.map((block, index) => {
                const isActive = block.id === session.currentBlockId
                const isPast = index < currentBlockIndex

                return (
                  <button
                    key={block.id}
                    onClick={() => handleBlockClick(block)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg transition-all",
                      isActive && "bg-primary text-primary-foreground shadow-lg",
                      !isActive && isPast && "bg-white/5 text-white/50",
                      !isActive && !isPast && "bg-white/10 text-white hover:bg-white/20",
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{block.title}</span>
                      <span className="text-xs opacity-70">{block.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          isActive && "bg-primary-foreground/20",
                          !isActive && "bg-white/10",
                        )}
                      >
                        {block.type}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Timer Card */}
            <Card className="p-8 bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
              <div className="text-center mb-6">
                <div className="text-7xl font-bold text-white mb-2">{formatTime(elapsedTime)}</div>
                <p className="text-white/60 text-lg">Session Time</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={handlePlayPause} size="lg" className="gap-2 px-8">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={handleNextBlock}
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  disabled={currentBlockIndex === workshop.blocks.length - 1}
                >
                  <SkipForward className="h-5 w-5" />
                  Next Activity
                </Button>
              </div>
            </Card>

            {/* Current Activity */}
            {currentBlock && (
              <Card className="p-6 bg-black/20 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Play className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentBlock.title}</h2>
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="h-4 w-4" />
                      <span>{currentBlock.duration} minutes</span>
                    </div>
                  </div>
                </div>

                {currentBlock.type === "discussion" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-sm text-white/60 mb-2">Discussion Prompt</p>
                      <p className="text-white text-lg">{currentBlock.prompt}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-white/60 mb-1">Grouping Method</p>
                        <p className="text-white capitalize">{currentBlock.groupingMethod}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-white/60 mb-1">Reflection</p>
                        <p className="text-white">{currentBlock.hasReflection ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentBlock.type === "survey" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-sm text-white/60 mb-2">Survey Subscales</p>
                      {currentBlock.subscales.map((subscale) => (
                        <div key={subscale.id} className="mb-2">
                          <p className="text-white font-medium">{subscale.title}</p>
                          <p className="text-sm text-white/60">{subscale.questions.length} questions</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Participants */}
            <Card className="p-6 bg-black/20 border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Participants ({session.participants.length})</h3>
              <div className="grid grid-cols-4 gap-4">
                {session.participants.slice(0, 8).map((participant) => (
                  <div
                    key={participant.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col items-center gap-2"
                  >
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold",
                        participant.status === "thinking" && "bg-blue-500/30 ring-2 ring-blue-500/50",
                        participant.status === "finished" && "bg-green-500/30 ring-2 ring-green-500/50",
                        participant.status === "help-needed" && "bg-red-500/30 ring-2 ring-red-500/50",
                      )}
                    >
                      {participant.name.charAt(0)}
                    </div>
                    <span className="text-xs text-white/80 text-center line-clamp-1">{participant.name}</span>
                  </div>
                ))}
                {session.participants.length > 8 && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-white/60 text-sm">+{session.participants.length - 8} more</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
