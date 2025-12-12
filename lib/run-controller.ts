import { getSession, updateSession } from "./session-storage"

export function getRunning(sessionId: string) {
  const s = getSession(sessionId)
  return {
    runningBlockId: s?.currentBlockId || null,
    isRunning: !!s?.isRunning,
    timers: s?.timers || {},
  }
}

export function startBlock(sessionId: string, blockId: string) {
  const s = getSession(sessionId)
  if (!s) return
  // Ensure timers map contains the block key
  const timers = { ...(s.timers || {}) }
  if (typeof timers[blockId] !== "number") timers[blockId] = 0
  updateSession(sessionId, { currentBlockId: blockId, isRunning: true, timers })
}

export function togglePause(sessionId: string) {
  const s = getSession(sessionId)
  if (!s) return
  updateSession(sessionId, { isRunning: !s.isRunning })
}

export function addTime(sessionId: string, blockId: string, seconds: number, capTo?: number) {
  const s = getSession(sessionId)
  if (!s) return
  const timers = { ...(s.timers || {}) }
  const cur = timers[blockId] || 0
  let next = cur + seconds
  if (typeof capTo === "number") next = Math.min(capTo, next)
  timers[blockId] = next
  updateSession(sessionId, { timers })
}

