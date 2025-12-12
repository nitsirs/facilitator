"use client"

import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { DiscussionBlock } from "@/lib/types"

export function DiscussionView({
  block,
  reflection,
  onReflectionChange,
}: {
  block: DiscussionBlock
  reflection: string
  onReflectionChange: (v: string) => void
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <div className="text-sm text-muted-foreground mb-2">Discussion Prompt</div>
        <div className="text-lg leading-relaxed">{block.prompt || "No prompt"}</div>
      </Card>

      {block.hasReflection && (
        <Card className="p-6 bg-card border-border">
          <Label htmlFor="reflection" className="mb-2 inline-block">
            Reflection (optional)
          </Label>
          <Textarea
            id="reflection"
            placeholder="Write your reflection..."
            value={reflection}
            onChange={(e) => onReflectionChange(e.target.value)}
            rows={4}
          />
        </Card>
      )}
    </div>
  )
}

