"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Plus, Clock, Calendar, FileText, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Workshop } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WorkshopLibraryProps {
  workshops: Workshop[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onCreateWorkshop: () => void
}

export function WorkshopLibrary({ workshops, searchQuery, onSearchChange, onCreateWorkshop }: WorkshopLibraryProps) {
  const upcomingWorkshops = workshops.filter((w) => w.status === "upcoming")
  const draftWorkshops = workshops.filter((w) => w.status === "draft")

  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Room</h1>
          <p className="text-muted-foreground text-lg">Manage your workshops and sessions</p>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search workshops"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-12 text-base bg-card border-border"
            />
          </div>
          <Button onClick={onCreateWorkshop} size="lg" className="h-12 px-6 gap-2">
            <Plus className="h-5 w-5" />
            Create new
          </Button>
        </div>

        {upcomingWorkshops.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Upcoming Workshops</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          </section>
        )}

        {draftWorkshops.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Drafts</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {draftWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          </section>
        )}

        {workshops.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No workshops yet</h3>
            <p className="text-muted-foreground mb-6">Create your first workshop to get started</p>
            <Button onClick={onCreateWorkshop} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create Workshop
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const router = useRouter()

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "Not set"
    const hours = Math.floor(minutes / 60)
    return `${hours} hrs`
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

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Import dynamically to avoid SSR issues
    import("@/lib/session-storage").then(({ createSession }) => {
      const session = createSession(workshop)
      router.push(`/session/${session.id}/dashboard`)
    })
  }

  return (
    <Link href={`/workshop/${workshop.id}`}>
      <Card
        className={cn(
          "p-6 hover:shadow-lg transition-all cursor-pointer border-border bg-card",
          "hover:border-primary/50 group",
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground text-balance">{workshop.title}</h3>
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
                "text-xs px-2 py-1 rounded-full font-medium",
                workshop.status === "upcoming" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
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
            <Calendar className="h-4 w-4" />
            <span>{formatDate(workshop.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(workshop.duration)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{workshop.blocks.length} activities</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
