"use client"

import { useEffect, useState } from "react"
import { PositionSelection } from "@/components/interview/position-selection"
import { ResultsFeedback } from "@/components/interview/results-feedback"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

interface Position {
  id: string
  title: string
  description: string
  level: string
  duration: string
  questions: Array<{
    id: string
    question: string
    followUp: string
  }>
}

interface InterviewResults {
  position: string
  duration: number
  questionsAnswered: number
  completedAt: string
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [interviewResults, setInterviewResults] = useState<InterviewResults | null>(null)
  const router = useRouter()

  const handlePositionSelect = (position: Position) => {
    router.push(`/interview/${position.id}`)
  }

  const handleRetakeInterview = () => {
    setInterviewResults(null)
    // Keep the same position selected
  }

  const handleSelectNewPosition = () => {
    setInterviewResults(null)
    setSelectedPosition(null)
    // Keep the user logged in
  }

  // Show registration if no user
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/register")
    }
  }, [user, router, isLoading])

  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <h1>Loading...</h1>
      </div>
    )
  }

  // Show position selection if user exists but no position selected
  if (!selectedPosition) {
    return <PositionSelection user={user} onPositionSelect={handlePositionSelect} />
  }

  if (interviewResults) {
    return (
      <ResultsFeedback
        user={user}
        position={selectedPosition}
        results={interviewResults}
        onRetakeInterview={handleRetakeInterview}
        onSelectNewPosition={handleSelectNewPosition}
      />
    )
  }
}
