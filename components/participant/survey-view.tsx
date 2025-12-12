"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Question, SurveyBlock } from "@/lib/types"
import type { ParticipantResponses, Answer } from "@/lib/participant-responses"

export function SurveyView({
  block,
  responses,
  onChange,
}: {
  block: SurveyBlock
  responses: ParticipantResponses
  onChange: (qid: string, value: Answer) => void
}) {
  return (
    <div className="space-y-6">
      {block.subscales.map((sub) => (
        <Card key={sub.id} className="p-6 bg-card border-border">
          <div className="text-base font-semibold mb-4">{sub.title}</div>
          <div className="space-y-4">
            {sub.questions.map((q) => (
              <QuestionItem key={q.id} q={q} value={responses[q.id]} onChange={(v) => onChange(q.id, v)} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

function QuestionItem({
  q,
  value,
  onChange,
}: {
  q: Question
  value: Answer | undefined
  onChange: (v: Answer) => void
}) {
  if (q.type === "markdown") {
    return (
      <div className="p-3 rounded bg-secondary/30 text-sm text-muted-foreground whitespace-pre-wrap">
        {q.text}
      </div>
    )
  }
  if (q.type === "open-text") {
    return (
      <div className="space-y-2">
        <Label>{q.text}</Label>
        <Textarea
          placeholder="Type your answer"
          value={(value as string) || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
        />
      </div>
    )
  }
  if (q.type === "multiple-choice") {
    return (
      <div className="space-y-2">
        <Label>{q.text}</Label>
        <RadioGroup value={(value as string) || ""} onValueChange={(v) => onChange(v)}>
          {(q.options || []).map((opt, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <RadioGroupItem id={`${q.id}-${idx}`} value={opt} />
              <Label htmlFor={`${q.id}-${idx}`} className="font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    )
  }
  if (q.type === "likert" && q.scale) {
    const { min, max, labels } = q.scale
    const range = Array.from({ length: max - min + 1 }, (_, i) => i + min)
    return (
      <div className="space-y-2">
        <Label>{q.text}</Label>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{labels?.min}</span>
          <span>{labels?.max}</span>
        </div>
        <div className="flex gap-2 items-center">
          {range.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`h-10 w-10 rounded-md border text-sm ${
                value === n ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    )
  }
  return null
}

