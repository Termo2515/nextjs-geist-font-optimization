"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/creami")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">TERMOEXPERT SRLU</h1>
        <p className="text-muted-foreground">Reindirizzamento al sistema CREAMI...</p>
      </div>
    </div>
  )
}
