"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, GripVertical } from "lucide-react"
import type { SurveyBlock, Question, Subscale, QuestionType } from "@/lib/types"

interface SurveyEditorProps {
  block: SurveyBlock
  onUpdate: (block: SurveyBlock) => void
}

export function SurveyEditor({ block, onUpdate }: SurveyEditorProps) {
  const [activeSubscaleId, setActiveSubscaleId] = useState<string>(block.subscales[0]?.id || "")

  const activeSubscale = block.subscales.find((s) => s.id === activeSubscaleId)

  const handleAddSubscale = () => {
    const newSubscale: Subscale = {
      id: `subscale-${Date.now()}`,
      title: `Block ${block.subscales.length + 1}`,
      questions: [],
    }
    onUpdate({
      ...block,
      subscales: [...block.subscales, newSubscale],
    })
    setActiveSubscaleId(newSubscale.id)
  }

  const handleUpdateSubscale = (updatedSubscale: Subscale) => {
    onUpdate({
      ...block,
      subscales: block.subscales.map((s) => (s.id === updatedSubscale.id ? updatedSubscale : s)),
    })
  }

  const handleDeleteSubscale = (subscaleId: string) => {
    const newSubscales = block.subscales.filter((s) => s.id !== subscaleId)
    onUpdate({
      ...block,
      subscales: newSubscales,
    })
    if (activeSubscaleId === subscaleId && newSubscales.length > 0) {
      setActiveSubscaleId(newSubscales[0].id)
    }
  }

  const handleAddQuestion = (type: QuestionType) => {
    if (!activeSubscale) return

    const newQuestion: Question =
      type === "markdown"
        ? {
            id: `q-${Date.now()}`,
            type: "markdown",
            text: "**Instructions:** Add your markdown text here",
          }
        : type === "likert"
          ? {
              id: `q-${Date.now()}`,
              type: "likert",
              text: "Question text",
              scale: {
                min: 1,
                max: 5,
                labels: { min: "Strongly Disagree", max: "Strongly Agree" },
              },
            }
          : type === "multiple-choice"
            ? {
                id: `q-${Date.now()}`,
                type: "multiple-choice",
                text: "Question text",
                options: ["Option 1", "Option 2", "Option 3"],
              }
            : {
                id: `q-${Date.now()}`,
                type: "open-text",
                text: "Question text",
              }

    handleUpdateSubscale({
      ...activeSubscale,
      questions: [...activeSubscale.questions, newQuestion],
    })
  }

  const handleUpdateQuestion = (questionId: string, updatedQuestion: Question) => {
    if (!activeSubscale) return

    handleUpdateSubscale({
      ...activeSubscale,
      questions: activeSubscale.questions.map((q) => (q.id === questionId ? updatedQuestion : q)),
    })
  }

  const handleDeleteQuestion = (questionId: string) => {
    if (!activeSubscale) return

    handleUpdateSubscale({
      ...activeSubscale,
      questions: activeSubscale.questions.filter((q) => q.id !== questionId),
    })
  }

  return (
    <div className="space-y-6">
      {/* Survey Header */}
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <div>
            <Label htmlFor="survey-title">Survey Title</Label>
            <Input
              id="survey-title"
              value={block.title}
              onChange={(e) => onUpdate({ ...block, title: e.target.value })}
              placeholder="Enter survey title"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="survey-duration">Duration (minutes)</Label>
            <Input
              id="survey-duration"
              type="number"
              value={block.duration}
              onChange={(e) => onUpdate({ ...block, duration: Number.parseInt(e.target.value) || 0 })}
              className="mt-1.5"
            />
          </div>
        </div>
      </Card>

      {/* Subscales Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {block.subscales.map((subscale) => (
          <button
            key={subscale.id}
            onClick={() => setActiveSubscaleId(subscale.id)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeSubscaleId === subscale.id
                ? "bg-primary text-primary-foreground"
                : "bg-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            {subscale.title}
          </button>
        ))}
        <Button onClick={handleAddSubscale} variant="outline" size="sm" className="ml-2 gap-1 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Block
        </Button>
      </div>

      {/* Active Subscale Editor */}
      {activeSubscale && (
        <div className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <Label htmlFor="subscale-title">Block Title</Label>
              {block.subscales.length > 1 && (
                <Button
                  onClick={() => handleDeleteSubscale(activeSubscale.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Input
              id="subscale-title"
              value={activeSubscale.title}
              onChange={(e) => handleUpdateSubscale({ ...activeSubscale, title: e.target.value })}
              placeholder="Enter block title"
            />
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            {activeSubscale.questions.map((question) => (
              <QuestionEditor
                key={question.id}
                question={question}
                onUpdate={(updated) => handleUpdateQuestion(question.id, updated)}
                onDelete={() => handleDeleteQuestion(question.id)}
              />
            ))}
          </div>

          {/* Add Question Buttons */}
          <Card className="p-6 bg-card border-border">
            <Label className="mb-3 block">Add Question</Label>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleAddQuestion("markdown")} variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Text/Markdown
              </Button>
              <Button onClick={() => handleAddQuestion("likert")} variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Likert Scale
              </Button>
              <Button
                onClick={() => handleAddQuestion("multiple-choice")}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Multiple Choice
              </Button>
              <Button onClick={() => handleAddQuestion("open-text")} variant="outline" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Open Text
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function QuestionEditor({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question
  onUpdate: (question: Question) => void
  onDelete: () => void
}) {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground mt-2 cursor-move" />
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="capitalize">{question.type.replace("-", " ")}</Label>
            <Button onClick={onDelete} variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {question.type === "markdown" ? (
            <Textarea
              value={question.text}
              onChange={(e) => onUpdate({ ...question, text: e.target.value })}
              placeholder="Enter markdown text"
              rows={3}
              className="font-mono text-sm"
            />
          ) : (
            <Input
              value={question.text}
              onChange={(e) => onUpdate({ ...question, text: e.target.value })}
              placeholder="Enter question text"
            />
          )}

          {question.type === "likert" && question.scale && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label htmlFor={`scale-min-${question.id}`} className="text-xs">
                  Min Label
                </Label>
                <Input
                  id={`scale-min-${question.id}`}
                  value={question.scale.labels.min}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      scale: question.scale
                        ? { ...question.scale, labels: { ...question.scale.labels, min: e.target.value } }
                        : undefined,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor={`scale-max-${question.id}`} className="text-xs">
                  Max Label
                </Label>
                <Input
                  id={`scale-max-${question.id}`}
                  value={question.scale.labels.max}
                  onChange={(e) =>
                    onUpdate({
                      ...question,
                      scale: question.scale
                        ? { ...question.scale, labels: { ...question.scale.labels, max: e.target.value } }
                        : undefined,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  {Array.from({ length: question.scale.max - question.scale.min + 1 }, (_, i) => (
                    <span key={i} className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full border-2 border-border" />
                      {question.scale!.min + i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {question.type === "multiple-choice" && question.options && (
            <div className="space-y-2 pt-2">
              <Label className="text-xs">Options</Label>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])]
                      newOptions[index] = e.target.value
                      onUpdate({ ...question, options: newOptions })
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index)
                      onUpdate({ ...question, options: newOptions })
                    }}
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => {
                  onUpdate({
                    ...question,
                    options: [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`],
                  })
                }}
                variant="outline"
                size="sm"
                className="w-full gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Option
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
