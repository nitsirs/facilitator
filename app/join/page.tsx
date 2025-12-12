"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getSessions } from "@/lib/session-storage"

export default function JoinPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [code, setCode] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    const c = params.get("code")
    if (c) setCode(c)
  }, [params])

  const handleJoin = () => {
    const sessions = getSessions()
    const s = sessions.find((x) => x.joinCode?.toUpperCase() === code.trim().toUpperCase())
    if (!s) return alert("Session not found")
    const pid = `u${Date.now()}`
    router.push(`/participant/${s.id}?name=${encodeURIComponent(name || "Guest")}&pid=${pid}`)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 p-6 rounded-lg border bg-card">
        <h1 className="text-xl font-semibold">Join Workshop</h1>
        <Input placeholder="Join Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button className="w-full" onClick={handleJoin}>
          Join
        </Button>
      </div>
    </div>
  )
}

