import type { Block, Workshop } from "./types"

export type SessionRecordStatus = "active" | "completed"

export interface SessionRecord {
  id: string
  workshopId: string
  workshopTitle: string
  blocksCount: number
  blocksSnapshot: Block[]
  startedAt: string
  endedAt?: string
  durationSec?: number
  status: SessionRecordStatus
  currentBlockId?: string | null
}

const STORAGE_KEY = "facilitator-session-history"

function readAll(): SessionRecord[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? (JSON.parse(data) as SessionRecord[]) : []
}

function writeAll(items: SessionRecord[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getSessionHistory(): SessionRecord[] {
  return readAll().sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

export function startSessionRecord(workshop: Workshop, currentBlockId?: string | null): SessionRecord {
  const items = readAll()
  const id = `h${Date.now()}`
  const record: SessionRecord = {
    id,
    workshopId: workshop.id,
    workshopTitle: workshop.title || "Untitled Workshop",
    blocksCount: workshop.blocks.length,
    blocksSnapshot: workshop.blocks,
    startedAt: new Date().toISOString(),
    status: "active",
    currentBlockId: currentBlockId ?? null,
  }
  items.unshift(record)
  writeAll(items)
  return record
}

export function updateSessionRecord(id: string, updates: Partial<SessionRecord>) {
  const items = readAll()
  const idx = items.findIndex((it) => it.id === id)
  if (idx === -1) return
  items[idx] = { ...items[idx], ...updates }
  writeAll(items)
}

export function completeSessionRecord(id: string) {
  const items = readAll()
  const idx = items.findIndex((it) => it.id === id)
  if (idx === -1) return
  const now = new Date().toISOString()
  const started = new Date(items[idx].startedAt).getTime()
  const durationSec = Math.max(0, Math.floor((Date.now() - started) / 1000))
  items[idx] = { ...items[idx], status: "completed", endedAt: now, durationSec }
  writeAll(items)
}

