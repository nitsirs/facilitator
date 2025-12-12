"use client"

import { useEffect, useState } from "react"
import { HomeSidebar } from "@/components/home/sidebar"
import { WorkshopLibrary } from "@/components/home/workshop-library"
import type { Workshop } from "@/lib/types"
import { useRouter } from "next/navigation"
import { saveDraft } from "@/lib/draft-storage"
import { getWorkshops } from "@/lib/workshop-storage"
import { mockWorkshops } from "@/lib/mock-data"

export default function HomePage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleCreateWorkshop = () => {
    const newWorkshop: Workshop = {
      id: `w${Date.now()}`,
      title: "",
      blocks: [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveDraft(newWorkshop)
    setWorkshops([newWorkshop, ...workshops])
    router.push(`/facilitator/${newWorkshop.id}`)
  }

  useEffect(() => {
    // Load from localStorage first; fallback to mocks if empty
    const saved = getWorkshops()
    if (saved.length > 0) {
      setWorkshops(saved)
    } else {
      setWorkshops(mockWorkshops)
    }
  }, [])

  const filteredWorkshops = workshops.filter((w) => w.title.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-screen flex bg-background text-foreground">
      <HomeSidebar />
      <WorkshopLibrary
        workshops={filteredWorkshops}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateWorkshop={handleCreateWorkshop}
      />
    </div>
  )
}
