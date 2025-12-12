"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft } from "lucide-react"
import { mockWorkshops } from "@/lib/mock-data"
import { WorkshopAgenda } from "@/components/workshop/workshop-agenda"
import { WorkshopDetails } from "@/components/workshop/workshop-details"
import type { Block, EditorView, Workshop } from "@/lib/types"
import { saveWorkshop, getWorkshop } from "@/lib/workshop-storage"
import { getDraft, saveDraft } from "@/lib/draft-storage"
import { useToast } from "@/hooks/use-toast"

export default function WorkshopEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const workshopId = params.id as string

  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [title, setTitle] = useState("")
  const [blocks, setBlocks] = useState<Block[]>([])
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<EditorView>("overview")

  useEffect(() => {
    const loadedWorkshop =
      getDraft(workshopId) || getWorkshop(workshopId) || mockWorkshops.find((w) => w.id === workshopId)
    if (loadedWorkshop) {
      setWorkshop(loadedWorkshop)
      setTitle(loadedWorkshop.title)
      setBlocks(loadedWorkshop.blocks)
      setActiveBlockId(loadedWorkshop.blocks[0]?.id || null)
    }
  }, [workshopId])

  useEffect(() => {
    if (!workshop) return
    const updatedWorkshop: Workshop = {
      ...workshop,
      title,
      blocks,
      updatedAt: new Date().toISOString(),
    }
    saveDraft(updatedWorkshop)
  }, [title, blocks, workshop])

  const activeBlock = blocks.find((b) => b.id === activeBlockId)

  const handleBlockUpdate = (updatedBlock: Block) => {
    setBlocks(blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)))
  }

  const handleAddBlock = (type: "survey" | "discussion") => {
    const newBlock: Block =
      type === "survey"
        ? {
            id: `block-${Date.now()}`,
            type: "survey",
            title: "New Survey",
            duration: 10,
            subscales: [
              {
                id: `subscale-${Date.now()}`,
                title: "Block 1",
                questions: [],
              },
            ],
          }
        : {
            id: `block-${Date.now()}`,
            type: "discussion",
            title: "New Discussion",
            duration: 10,
            prompt: "",
            groupingMethod: "random",
            hasReflection: false,
          }

    setBlocks([...blocks, newBlock])
    setActiveBlockId(newBlock.id)
    setActiveView(type)
  }

  const handlePublish = () => {
    if (!workshop) return

    const updatedWorkshop: Workshop = {
      ...workshop,
      title,
      blocks,
      status: "upcoming",
      updatedAt: new Date().toISOString(),
    }

    saveWorkshop(updatedWorkshop)
    setWorkshop(updatedWorkshop)

    toast({
      title: "Workshop published",
      description: "Your workshop has been saved successfully.",
    })
  }

  if (!workshop) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading workshop...</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 max-w-md"
            placeholder="Untitled Workshop"
          />
        </div>
        <Button size="lg" className="gap-2" onClick={handlePublish}>
          Publish
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <WorkshopAgenda
          blocks={blocks}
          activeBlockId={activeBlockId}
          onBlockSelect={(id) => {
            setActiveBlockId(id)
            const block = blocks.find((b) => b.id === id)
            if (block) {
              setActiveView(
                block.type === "survey" ? "survey" : block.type === "discussion" ? "discussion" : "overview",
              )
            }
          }}
          onAddBlock={handleAddBlock}
          workshopId={workshopId}
        />

        <WorkshopDetails
          activeBlock={activeBlock}
          activeView={activeView}
          onBlockUpdate={handleBlockUpdate}
          onViewChange={setActiveView}
        />
      </div>
    </div>
  )
}
