"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CouponRegistration } from "@/components/auth/coupon-registration"
import { PositionSelection } from "@/components/interview/position-selection"
import { VideoInterview } from "@/components/interview/video-interview"
import { ResultsFeedback } from "@/components/interview/results-feedback"
import { ShieldIcon } from "lucide-react"
// import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

interface User {
  email: string
  name: string
}

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
  const [user, setUser] = useState<User | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [interviewResults, setInterviewResults] = useState<InterviewResults | null>(null)

  const handleRegistrationSuccess = (userData: User) => {
    setUser(userData)
  }

  const handlePositionSelect = (position: Position) => {
    setSelectedPosition(position)
  }

  const handleInterviewComplete = (results: InterviewResults) => {
    setInterviewResults(results)
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
  if (!user) {
    return (
      <div className="relative">
        <CouponRegistration onRegistrationSuccess={handleRegistrationSuccess} />
        <div className="fixed bottom-4 right-4">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="bg-background/80 backdrop-blur-sm">
              <ShieldIcon className="mr-2 h-4 w-4" />
              Admin Access
            </Button>
          </Link>
        </div>
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

  // Show video interview interface
  return <VideoInterview
    user={user}
    position={selectedPosition}
    onInterviewComplete={handleInterviewComplete}
  />
}
