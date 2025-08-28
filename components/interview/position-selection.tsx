"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, ChevronRight, Loader2 } from "lucide-react"

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

interface PositionSelectionProps {
  user: { email: string; name: string }
  onPositionSelect: (position: Position) => void
}

export function PositionSelection({ user, onPositionSelect }: PositionSelectionProps) {
  const [positions, setPositions] = useState<Position[]>([])
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    const loadPositions = async () => {
      try {
        const response = await fetch("/api/positions")
        const data = await response.json()
        setPositions(data.positions)
      } catch (error) {
        console.error("Failed to load positions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPositions()
  }, [])

  const handleStartInterview = async () => {
    if (!selectedPosition) return

    setIsStarting(true)
    // Simulate preparation time
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onPositionSelect(selectedPosition)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading interview positions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, {user.name}!</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Choose your interview position to begin your AI-powered practice session
          </p>
          <div className="bg-card border border-border rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-card-foreground">
              Our AI interviewer will conduct a professional interview simulation with real-time feedback and
              personalized questions based on your selected role.
            </p>
          </div>
        </div>

        {/* Position Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {positions.map((position) => (
            <Card
              key={position.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPosition?.id === position.id
                  ? "ring-2 ring-accent border-accent bg-accent/5"
                  : "hover:border-accent/50"
              }`}
              onClick={() => setSelectedPosition(position)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-card-foreground mb-2">{position.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {position.description}
                    </CardDescription>
                  </div>
                  {selectedPosition?.id === position.id && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-accent-foreground rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{position.level}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{position.duration}</span>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {position.questions.length} Questions
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Position Details */}
        {selectedPosition && (
          <Card className="mb-8 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-xl text-card-foreground">Interview Details</CardTitle>
              <CardDescription>
                You've selected <strong>{selectedPosition.title}</strong> - Here's what to expect:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Interview Structure</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI introduction and setup verification</li>
                    <li>• Personal introduction (2-3 minutes)</li>
                    <li>• Technical questions with follow-ups</li>
                    <li>• Real-time discussion and feedback</li>
                    <li>• Comprehensive results and recommendations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-card-foreground mb-2">Requirements</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Working microphone and camera</li>
                    <li>• Quiet, well-lit environment</li>
                    <li>• Stable internet connection</li>
                    <li>• Allow browser permissions for media access</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleStartInterview}
            disabled={!selectedPosition || isStarting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
          >
            {isStarting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Preparing Interview...
              </>
            ) : (
              <>
                Start Interview
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {!selectedPosition && (
          <p className="text-center text-sm text-muted-foreground mt-4">Please select a position above to continue</p>
        )}
      </div>
    </div>
  )
}
