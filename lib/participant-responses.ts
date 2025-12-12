import type { Question, SurveyBlock } from "./types"

export type Answer = string | number | string[]

export interface ParticipantResponses {
  [questionId: string]: Answer
}

const key = (sessionId: string, participantId: string) =>
  `facilitator-responses-${sessionId}-${participantId}`

export function getResponses(sessionId: string, participantId: string): ParticipantResponses {
  if (typeof window === "undefined") return {}
  const raw = localStorage.getItem(key(sessionId, participantId))
  return raw ? (JSON.parse(raw) as ParticipantResponses) : {}
}

export function saveResponses(
  sessionId: string,
  participantId: string,
  responses: ParticipantResponses,
): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key(sessionId, participantId), JSON.stringify(responses))
}

