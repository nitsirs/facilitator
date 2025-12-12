"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Plus, User, Trash2 } from "lucide-react"
import type { DiscussionBlock, GroupingMethod } from "@/lib/types"

interface DiscussionEditorProps {
  block: DiscussionBlock
  onUpdate: (block: DiscussionBlock) => void
}

interface Round {
  id: string
  prompt: string
  groupingMethod: GroupingMethod
  duration: number
}

export function DiscussionEditor({ block, onUpdate }: DiscussionEditorProps) {
  const [rounds, setRounds] = useState<Round[]>([
    {
      id: "round-1",
      prompt: block.prompt || "",
      groupingMethod: block.groupingMethod || "random",
      duration: 2,
    },
  ])

  const [showReflection, setShowReflection] = useState(block.hasReflection)
  const [reflectionPrompt, setReflectionPrompt] = useState("")

  const handleAddRound = () => {
    const newRound: Round = {
      id: `round-${Date.now()}`,
      prompt: "",
      groupingMethod: "random",
      duration: 2,
    }
    setRounds([...rounds, newRound])
  }

  const handleUpdateRound = (roundId: string, updates: Partial<Round>) => {
    setRounds(rounds.map((r) => (r.id === roundId ? { ...r, ...updates } : r)))

    // Update the main block with first round data
    if (roundId === rounds[0].id) {
      onUpdate({
        ...block,
        prompt: updates.prompt !== undefined ? updates.prompt : rounds[0].prompt,
        groupingMethod: updates.groupingMethod !== undefined ? updates.groupingMethod : rounds[0].groupingMethod,
      })
    }
  }

  const handleDeleteRound = (roundId: string) => {
    const newRounds = rounds.filter((r) => r.id !== roundId)
    setRounds(newRounds)
  }

  const handleReflectionToggle = (checked: boolean) => {
    setShowReflection(checked)
    onUpdate({ ...block, hasReflection: checked })
  }

  return (
    <div className="space-y-6">
      {/* Discussion Header */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="discussion-title">Discussion Title</Label>
            <Input
              id="discussion-title"
              value={block.title}
              onChange={(e) => onUpdate({ ...block, title: e.target.value })}
              placeholder="Enter discussion title"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="discussion-duration">Duration (minutes)</Label>
            <Input
              id="discussion-duration"
              type="number"
              value={block.duration}
              onChange={(e) => onUpdate({ ...block, duration: Number.parseInt(e.target.value) || 0 })}
              className="mt-1.5"
            />
          </div>
        </div>
      </Card>

      {/* Rounds */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg">Discussion Rounds</Label>
          <Button onClick={handleAddRound} variant="outline" size="sm" className="gap-1 bg-transparent">
            <Plus className="h-4 w-4" />
            Add Round
          </Button>
        </div>

        {rounds.map((round, index) => (
          <Card key={round.id} className="p-6 bg-card border-border">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Round {index + 1}</Label>
                {rounds.length > 1 && (
                  <Button
                    onClick={() => handleDeleteRound(round.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`prompt-${round.id}`}>Prompt</Label>
                <Textarea
                  id={`prompt-${round.id}`}
                  value={round.prompt}
                  onChange={(e) => handleUpdateRound(round.id, { prompt: e.target.value })}
                  placeholder="Enter discussion prompt"
                  rows={3}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This prompt will be personalized for each participant based on their role
                </p>
              </div>

              <div>
                <Label htmlFor={`duration-${round.id}`}>Time (minutes)</Label>
                <Input
                  id={`duration-${round.id}`}
                  type="number"
                  value={round.duration}
                  onChange={(e) => handleUpdateRound(round.id, { duration: Number.parseInt(e.target.value) || 0 })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="mb-3 block">Grouping Method</Label>
                <RadioGroup
                  value={round.groupingMethod}
                  onValueChange={(value) => handleUpdateRound(round.id, { groupingMethod: value as GroupingMethod })}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="random" id={`random-${round.id}`} />
                    <Label htmlFor={`random-${round.id}`} className="font-normal cursor-pointer">
                      Random / Survey-based
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="table-based" id={`table-${round.id}`} />
                    <Label htmlFor={`table-${round.id}`} className="font-normal cursor-pointer">
                      Table-based (maintain distances)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manual" id={`manual-${round.id}`} />
                    <Label htmlFor={`manual-${round.id}`} className="font-normal cursor-pointer">
                      Manual Assignment
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Reflection Section */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reflection-toggle" className="text-base font-semibold">
                Reflection
              </Label>
              <p className="text-sm text-muted-foreground mt-1">Add a personal reflection phase after discussion</p>
            </div>
            <Switch id="reflection-toggle" checked={showReflection} onCheckedChange={handleReflectionToggle} />
          </div>

          {showReflection && (
            <div>
              <Label htmlFor="reflection-prompt">Reflection Prompt</Label>
              <Textarea
                id="reflection-prompt"
                value={reflectionPrompt}
                onChange={(e) => setReflectionPrompt(e.target.value)}
                placeholder="What insights did you gain from this discussion?"
                rows={3}
                className="mt-1.5"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Participants Preview */}
      <Card className="p-6 bg-card border-border">
        <Label className="text-base font-semibold mb-4 block">Participants Preview</Label>
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">P{i + 1}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
