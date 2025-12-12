"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Plus, X, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Block, Participant } from "@/lib/types"

interface RunCanvasProps {
  activeBlock: Block | undefined
  participants: Participant[]
  onModeChange: () => void
}

export function RunCanvas({ activeBlock, participants, onModeChange }: RunCanvasProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(activeBlock?.duration ? activeBlock.duration * 60 : 300)

  useEffect(() => {
    if (activeBlock) {
      setTimeLeft(activeBlock.duration * 60)
      setIsRunning(false)
    }
  }, [activeBlock])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  if (!activeBlock) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a block to run</p>
      </div>
    )
  }

  const prompt = activeBlock.type === "discussion" ? activeBlock.prompt : `Complete the ${activeBlock.title} survey`

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header with Exit Button */}
      <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-card-foreground">Live Session</h2>
        <Button variant="ghost" size="sm" onClick={onModeChange} className="gap-2">
          <X className="w-4 h-4" />
          Exit Run Mode
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex gap-6">
        {/* Main Control Area */}
        <div className="flex-1 space-y-6">
          {/* Control Deck */}
          <Card className="bg-card">
            <CardContent className="p-8 flex flex-col items-center gap-6">
              {/* Timer - Giant and Central */}
              <div className="text-center">
                <div
                  className={cn(
                    "text-9xl font-bold font-mono tabular-nums tracking-tight",
                    timeLeft < 60 && timeLeft > 0 && "text-destructive",
                    timeLeft === 0 && "text-destructive animate-pulse",
                  )}
                >
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">Time Remaining</p>
              </div>

              {/* Play/Pause Control */}
              <div className="flex gap-4">
                <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="w-48 h-16 text-lg gap-3">
                  {isRunning ? (
                    <>
                      <Pause className="w-6 h-6" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setTimeLeft((prev) => prev + 60)}
                  className="h-16 px-6 gap-2"
                >
                  <Plus className="w-5 h-5" />1 Min
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live Status - Current Prompt */}
          <Card className="bg-card">
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Current Activity
                  </h3>
                  <p className="text-2xl font-semibold mt-1 text-card-foreground">{activeBlock.title}</p>
                </div>
                <div className="px-3 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                  Live Sync
                </div>
              </div>
              <div className="mt-6 p-6 bg-secondary/30 rounded-lg">
                <p className="text-3xl leading-relaxed text-card-foreground">{prompt}</p>
              </div>
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
              <QrCode className="w-24 h-24 text-muted-foreground" />
              <div className="text-center">
                <p className="text-4xl font-bold font-mono">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Join at workshop.app</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
