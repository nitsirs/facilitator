import type { Workshop } from "./types"

// In-memory storage for draft workshops (not yet published)
const drafts = new Map<string, Workshop>()

export function saveDraft(workshop: Workshop): void {
  drafts.set(workshop.id, workshop)
}

export function getDraft(id: string): Workshop | null {
  return drafts.get(id) || null
}

export function deleteDraft(id: string): void {
  drafts.delete(id)
}

export function getAllDrafts(): Workshop[] {
  return Array.from(drafts.values())
}
