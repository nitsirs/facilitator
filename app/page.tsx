"use client"

import { useState } from "react"
import { HomeSidebar } from "@/components/home/sidebar"
import { WorkshopLibrary } from "@/components/home/workshop-library"
import { mockWorkshops } from "@/lib/mock-data"
import type { Workshop } from "@/lib/types"
import { useRouter } from "next/navigation"
import { saveDraft } from "@/lib/draft-storage"

export default function HomePage() {
  const [workshops, setWorkshops] = useState<Workshop[]>(mockWorkshops)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleCreateWorkshop = () => {
    const newWorkshop: Workshop = {
      id: `w${Date.now()}`,
      title: "Untitled Workshop",
      blocks: [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveDraft(newWorkshop)
    setWorkshops([newWorkshop, ...workshops])
    router.push(`/workshop/${newWorkshop.id}`)
  }

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
