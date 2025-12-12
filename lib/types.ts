export type BlockType = "discussion" | "survey" | "break"

export type GroupingMethod = "random" | "table-based" | "manual"

export type QuestionType = "likert" | "multiple-choice" | "open-text" | "markdown"

export interface Question {
  id: string
  type: QuestionType
  text: string
  options?: string[]
  scale?: { min: number; max: number; labels: { min: string; max: string } }
}

export interface Subscale {
  id: string
  title: string
  questions: Question[]
}

export interface DiscussionBlock {
  id: string
  type: "discussion"
  title: string
  duration: number
  prompt: string
  groupingMethod: GroupingMethod
  hasReflection: boolean
}

export interface SurveyBlock {
  id: string
  type: "survey"
  title: string
  duration: number
  subscales: Subscale[]
}

export interface BreakBlock {
  id: string
  type: "break"
  title: string
  duration: number
}

export type Block = DiscussionBlock | SurveyBlock | BreakBlock

export interface Participant {
  id: string
  name: string
  avatar: string
  status: "thinking" | "finished" | "help-needed"
}

export interface Workshop {
  id: string
  title: string
  date?: string
  duration?: number
  description?: string
  blocks: Block[]
  status: "draft" | "upcoming" | "completed"
  createdAt: string
  updatedAt: string
}

export type AppMode = "DESIGN" | "RUN"

export type EditorView = "survey" | "discussion" | "overview"

export interface Session {
  id: string
  workshopId: string
  title: string
  startedAt: string
  status: "active" | "paused" | "completed"
  currentBlockId?: string
  participants: Participant[]
  elapsedTime: number // in seconds
}
