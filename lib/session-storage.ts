import type { Session, Workshop } from "./types"
import { mockParticipants } from "./mock-data"

function genJoinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

export function createSession(workshop: Workshop): Session {
  const sessionId = `s${Date.now()}`
  const session: Session = {
    id: sessionId,
    workshopId: workshop.id,
    title: `${workshop.title} - ${new Date().toLocaleDateString()}`,
    startedAt: new Date().toISOString(),
    status: "active",
    currentBlockId: undefined,
    participants: mockParticipants,
    elapsedTime: 0,
    joinCode: genJoinCode(),
    isRunning: false,
    timers: Object.fromEntries(workshop.blocks.map((b) => [b.id, 0])),
  }

  // Store in localStorage
  const sessions = getSessions()
  sessions.push(session)
  localStorage.setItem("facilitator-sessions", JSON.stringify(sessions))

  localStorage.setItem(`session-workshop-${sessionId}`, JSON.stringify(workshop))

  return session
}

export function getSessionWorkshop(sessionId: string): Workshop | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(`session-workshop-${sessionId}`)
  return data ? JSON.parse(data) : null
}

export function getSessions(): Session[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("facilitator-sessions")
  return data ? JSON.parse(data) : []
}

export function getSession(id: string): Session | null {
  const sessions = getSessions()
  return sessions.find((s) => s.id === id) || null
}

export function updateSession(id: string, updates: Partial<Session>): void {
  const sessions = getSessions()
  const index = sessions.findIndex((s) => s.id === id)
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates }
    localStorage.setItem("facilitator-sessions", JSON.stringify(sessions))
  }
}
