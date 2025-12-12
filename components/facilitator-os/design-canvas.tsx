"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play } from "lucide-react"
import type { Block, DiscussionBlock, SurveyBlock } from "@/lib/types"

interface DesignCanvasProps {
  workshopTitle: string
  onTitleChange: (title: string) => void
  activeBlock: Block | undefined
  onBlockUpdate: (block: Block) => void
  onModeChange: () => void
}

export function DesignCanvas({
  workshopTitle,
  onTitleChange,
  activeBlock,
  onBlockUpdate,
  onModeChange,
}: DesignCanvasProps) {
  if (!activeBlock) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a block from the agenda to edit</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <Input
          value={workshopTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-2xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 max-w-2xl"
        />
        <Button onClick={onModeChange} size="lg" className="gap-2">
          <Play className="w-4 h-4" />
          Run Session
        </Button>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {activeBlock.type === "discussion" && (
            <DiscussionEditor block={activeBlock as DiscussionBlock} onUpdate={onBlockUpdate} />
          )}
          {activeBlock.type === "survey" && (
            <SurveyEditor block={activeBlock as SurveyBlock} onUpdate={onBlockUpdate} />
          )}
        </div>
      </div>
    </div>
  )
}

function DiscussionEditor({
  block,
  onUpdate,
}: {
  block: DiscussionBlock
  onUpdate: (block: Block) => void
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Discussion Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Prompt Text</Label>
            <Textarea
              id="prompt"
              value={block.prompt}
              onChange={(e) => onUpdate({ ...block, prompt: e.target.value })}
              className="mt-2 min-h-32"
              placeholder="Enter the discussion prompt..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={block.duration}
                onChange={(e) => onUpdate({ ...block, duration: Number.parseInt(e.target.value) || 0 })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="grouping">Grouping Strategy</Label>
              <Select
                value={block.groupingMethod}
                onValueChange={(value) =>
                  onUpdate({ ...block, groupingMethod: value as DiscussionBlock["groupingMethod"] })
                }
              >
                <SelectTrigger id="grouping" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="table-based">Table-based</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function SurveyEditor({ block, onUpdate }: { block: SurveyBlock; onUpdate: (block: Block) => void }) {
  return (
    <>
      {block.subscales.map((subscale) => (
        <Card key={subscale.id}>
          <CardHeader>
            <CardTitle>{subscale.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscale.questions.map((question, idx) => (
              <div key={question.id} className="p-4 bg-secondary/30 rounded-lg">
                {question.type === "markdown" ? (
                  <p className="text-sm text-muted-foreground">{question.text}</p>
                ) : (
                  <>
                    <p className="font-medium text-sm mb-2">
                      Question {idx}. {question.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Type: {question.type}
                      {question.scale && ` (${question.scale.min}-${question.scale.max})`}
                      {question.options && ` (${question.options.length} options)`}
                    </p>
                  </>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2 bg-transparent">
              Add Question
            </Button>
          </CardContent>
        </Card>
      ))}
    </>
  )
}
