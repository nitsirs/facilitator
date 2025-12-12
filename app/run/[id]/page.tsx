"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { mockWorkshops } from "@/lib/mock-data"
import type { Workshop } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const found = mockWorkshops.find((w) => w.id === resolvedParams.id)
    if (found) {
      setWorkshop(found)
    }
  }, [resolvedParams.id])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  if (!workshop) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Workshop not found</p>
      </div>
    )
  }

  const currentBlock = workshop.blocks[currentBlockIndex]
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between px-8 py-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{workshop.title}</h1>
            <p className="text-sm text-white/60">{workshop.blocks.length} activities</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Agenda Sidebar */}
        <aside className="w-80 border-r border-white/10 bg-black/20 backdrop-blur-sm overflow-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Agenda</h2>
            <div className="space-y-2">
              {workshop.blocks.map((block, index) => (
                <button
                  key={block.id}
                  onClick={() => setCurrentBlockIndex(index)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-all",
                    index === currentBlockIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/5 text-white/70 hover:bg-white/10",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{block.title}</span>
                    <span className="text-xs opacity-70">{block.duration}min</span>
                  </div>
                  <p className="text-xs opacity-70">{block.type === "survey" ? "Survey" : "Discussion"}</p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Stage */}
        <main className="flex-1 flex flex-col items-center justify-center p-12">
          {/* Giant Timer */}
          <div className="text-center mb-12">
            <div className="text-9xl font-bold text-white mb-4 tracking-tight">{formatTime(timeElapsed)}</div>
            <h2 className="text-4xl font-bold text-white mb-2">{currentBlock?.title || "No activity selected"}</h2>
            <p className="text-xl text-white/70">
              {currentBlock ? `${currentBlock.duration} minutes • ${currentBlock.type}` : ""}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-4 items-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setCurrentBlockIndex(Math.max(0, currentBlockIndex - 1))}
              disabled={currentBlockIndex === 0}
              className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </Button>

            <Button
              size="lg"
              onClick={() => setIsRunning(!isRunning)}
              className="h-16 px-8 text-lg bg-primary hover:bg-primary/90"
            >
              {isRunning ? <Pause className="h-6 w-6 mr-2" /> : <Play className="h-6 w-6 mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setTimeElapsed(0)}
              className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setCurrentBlockIndex(Math.min(workshop.blocks.length - 1, currentBlockIndex + 1))}
              disabled={currentBlockIndex === workshop.blocks.length - 1}
              className="h-14 px-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Activity Progress */}
          <div className="mt-12 w-full max-w-2xl">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>
                Activity {currentBlockIndex + 1} of {workshop.blocks.length}
              </span>
              <span>{Math.round(((currentBlockIndex + 1) / workshop.blocks.length) * 100)}% Complete</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentBlockIndex + 1) / workshop.blocks.length) * 100}%` }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
