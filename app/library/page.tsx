"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { HomeSidebar } from "@/components/home/sidebar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Clock, Calendar, FileText, Filter, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Workshop } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getWorkshops } from "@/lib/workshop-storage"
import { saveDraft } from "@/lib/draft-storage"
import { mockWorkshops } from "@/lib/mock-data"

export default function LibraryPage() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "upcoming" | "completed">("all")

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
    router.push(`/facilitator/${newWorkshop.id}`)
  }

  useEffect(() => {
    const saved = getWorkshops()
    if (saved.length > 0) {
      setWorkshops(saved)
    } else {
      setWorkshops(mockWorkshops)
    }
  }, [])

  const filteredWorkshops = workshops
    .filter((w) => w.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((w) => filterStatus === "all" || w.status === filterStatus)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <div className="h-screen flex bg-background text-foreground">
      <HomeSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Workshop Library</h1>
            <p className="text-muted-foreground text-lg">Browse and manage all your workshop templates</p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search workshops"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base bg-card border-border"
              />
            </div>
            <Button onClick={handleCreateWorkshop} size="lg" className="h-12 px-6 gap-2">
              <Plus className="h-5 w-5" />
              Create new
            </Button>
          </div>

          <div className="flex gap-2 mb-8">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              All
            </Button>
            <Button
              variant={filterStatus === "upcoming" ? "default" : "outline"}
              onClick={() => setFilterStatus("upcoming")}
            >
              Upcoming
            </Button>
            <Button variant={filterStatus === "draft" ? "default" : "outline"} onClick={() => setFilterStatus("draft")}>
              Drafts
            </Button>
            <Button
              variant={filterStatus === "completed" ? "default" : "outline"}
              onClick={() => setFilterStatus("completed")}
            >
              Completed
            </Button>
          </div>

          {filteredWorkshops.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No workshops found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "Try adjusting your search" : "Create your first workshop to get started"}
              </p>
              {!searchQuery && (
                <Button onClick={handleCreateWorkshop} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Workshop
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const router = useRouter()

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Not set"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    router.push(`/facilitator/${workshop.id}?mode=run`)
  }

  return (
    <Link href={`/facilitator/${workshop.id}`}>
      <Card
        className={cn(
          "p-6 hover:shadow-lg transition-all cursor-pointer border-border bg-card",
          "hover:border-primary/50 h-full group",
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground text-balance line-clamp-2">{workshop.title}</h3>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handlePlayClick}
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
            >
              <Play className="h-4 w-4" />
            </Button>
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2",
                workshop.status === "upcoming" && "bg-primary/10 text-primary",
                workshop.status === "draft" && "bg-muted text-muted-foreground",
                workshop.status === "completed" && "bg-green-500/10 text-green-600",
              )}
            >
              {workshop.status}
            </span>
          </div>
        </div>

        {workshop.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{workshop.description}</p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(workshop.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{formatDuration(workshop.duration)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 flex-shrink-0" />
            <span>{workshop.blocks.length} activities</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">Updated {formatLastUpdated(workshop.updatedAt)}</p>
        </div>
      </Card>
    </Link>
  )
}
