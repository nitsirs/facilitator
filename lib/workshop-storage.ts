import type { Workshop } from "./types"

export function saveWorkshop(workshop: Workshop): void {
  const workshops = getWorkshops()
  const existingIndex = workshops.findIndex((w) => w.id === workshop.id)

  if (existingIndex !== -1) {
    workshops[existingIndex] = { ...workshop, updatedAt: new Date().toISOString() }
  } else {
    workshops.push(workshop)
  }

  localStorage.setItem("facilitator-workshops", JSON.stringify(workshops))
}

export function getWorkshops(): Workshop[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem("facilitator-workshops")
  return data ? JSON.parse(data) : []
}

export function getWorkshop(id: string): Workshop | null {
  const workshops = getWorkshops()
  return workshops.find((w) => w.id === id) || null
}

export function deleteWorkshop(id: string): void {
  const workshops = getWorkshops()
  const filtered = workshops.filter((w) => w.id !== id)
  localStorage.setItem("facilitator-workshops", JSON.stringify(filtered))
}
