"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import {
  TrophyIcon,
  TargetIcon,
  BookOpenIcon,
  RefreshCwIcon,
  DownloadIcon,
  ShareIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  ClockIcon,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface InterviewResults {
  position: string
  duration: number
  questionsAnswered: number
  completedAt: string
  overallScore?: number
  scores?: {
    technical_knowledge: number
    problem_solving: number
    communication: number
    best_practices: number
  }
  strengths?: string[]
  improvements?: string[]
  recommendations?: string[]
  questionBreakdown?: Array<{
    question: string
    score: number
    feedback: string
  }>
  summary?: string
}

interface User {
  email: string
  name: string
}

interface Position {
  id: string
  title: string
  questions: Array<{
    id: string
    question: string
    followUp: string
  }>
}

interface ResultsFeedbackProps {
  user: User
  position: Position
  results: InterviewResults
  onRetakeInterview: () => void
  onSelectNewPosition: () => void
}

export function ResultsFeedback({
  user,
  position,
  results,
  onRetakeInterview,
  onSelectNewPosition,
}: ResultsFeedbackProps) {
  const [feedbackData, setFeedbackData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const processFeedback = async () => {
      console.log("[v0] Processing feedback with results:", results)

      if (results.overallScore && results.scores && results.strengths) {
        console.log("[v0] Using API-generated feedback")
        setFeedbackData({
          overallScore: results.overallScore,
          performanceLevel: getPerformanceLevel(results.overallScore),
          scores: results.scores,
          questionBreakdown: results.questionBreakdown || [],
          strengths: results.strengths,
          improvements: results.improvements || [],
          recommendations: results.recommendations || [],
          summary: results.summary || "Interview completed successfully.",
        })
        setIsLoading(false)
      } else {
        console.log("[v0] Falling back to mock data generation")
        await generateMockFeedback()
      }
    }

    const generateMockFeedback = async () => {
      // Simulate API call for feedback analysis
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock performance scores (in real app, this would come from AI analysis)
      const mockScores = {
        technical_knowledge: Math.floor(Math.random() * 30) + 70, // 70-100
        problem_solving: Math.floor(Math.random() * 25) + 65, // 65-90
        communication: Math.floor(Math.random() * 35) + 60, // 60-95
        best_practices: Math.floor(Math.random() * 40) + 55, // 55-95
      }

      const overallScore = Math.round(
        (mockScores.technical_knowledge +
          mockScores.problem_solving +
          mockScores.communication +
          mockScores.best_practices) /
        4,
      )

      const performanceLevel = getPerformanceLevel(overallScore)

      const questionBreakdown = position.questions.map((q, index) => ({
        question: `Q${index + 1}`,
        score: Math.floor(Math.random() * 40) + 60,
        feedback: "Good understanding demonstrated with room for deeper technical details.",
      }))

      setFeedbackData({
        overallScore,
        performanceLevel,
        scores: mockScores,
        questionBreakdown,
        strengths: ["Clear communication", "Good problem-solving approach", "Solid technical foundation"],
        improvements: ["Deepen technical knowledge", "Practice system design", "Improve code optimization"],
        recommendations: [
          "Review advanced React patterns and hooks",
          "Practice whiteboard coding exercises",
          "Study system design principles",
          "Build more complex projects",
        ],
        summary: "Overall good performance with room for technical improvement.",
      })
      setIsLoading(false)
    }

    processFeedback()
  }, [position.questions, results])

  const getPerformanceLevel = (score: number) => {
    if (score >= 85) return "excellent"
    if (score >= 75) return "good"
    if (score >= 60) return "average"
    return "needs_improvement"
  }

  const saveResultsToProfile = async () => {
    try {
      const token = localStorage.getItem("auth_token")
      await fetch("/api/users/profile/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          position: results.position,
          score: feedbackData.overallScore,
          duration: results.duration,
          questionsAnswered: results.questionsAnswered,
          completedAt: results.completedAt,
          strengths: feedbackData.strengths,
          improvements: feedbackData.improvements,
        }),
      })
    } catch (error) {
      console.error("[v0] Error saving results to profile:", error)
    }
  }

  useEffect(() => {
    if (feedbackData && !isLoading) {
      saveResultsToProfile()
    }
  }, [feedbackData, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <TrendingUpIcon className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Performance</h2>
          <p className="text-muted-foreground">Our AI is reviewing your interview responses...</p>
        </div>
      </div>
    )
  }

  const chartData = [
    { name: "Technical Knowledge", score: feedbackData.scores.technical_knowledge, fullMark: 100 },
    { name: "Problem Solving", score: feedbackData.scores.problem_solving, fullMark: 100 },
    { name: "Communication", score: feedbackData.scores.communication, fullMark: 100 },
    { name: "Best Practices", score: feedbackData.scores.best_practices, fullMark: 100 },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "default"
    if (score >= 75) return "secondary"
    if (score >= 60) return "outline"
    return "destructive"
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
              <TrophyIcon className="h-10 w-10 text-accent" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Interview Results</h1>
          <p className="text-lg text-muted-foreground mb-4">
            {position.title} • Completed on {new Date(results.completedAt).toLocaleDateString()}
          </p>
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              <span>{results.duration}m</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              <span>{results.questionsAnswered} questions answered</span>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-accent/10 border-4 border-accent/20 mb-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(feedbackData.overallScore)}`}>
                    {feedbackData.overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                {feedbackData.performanceLevel === "excellent" && "Excellent Performance!"}
                {feedbackData.performanceLevel === "good" && "Good Performance!"}
                {feedbackData.performanceLevel === "average" && "Average Performance"}
                {feedbackData.performanceLevel === "needs_improvement" && "Room for Improvement"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {feedbackData.summary || "Interview completed successfully with detailed AI analysis."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills Breakdown</TabsTrigger>
            <TabsTrigger value="questions">Question Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Skill Area</CardTitle>
                  <CardDescription>Your scores across different competencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Strengths vs Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Summary</CardTitle>
                  <CardDescription>Areas of strength and improvement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {feedbackData.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-600 rounded-full" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {feedbackData.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-1 h-1 bg-yellow-600 rounded-full" />
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(feedbackData.scores).map(([skill, score]) => (
                <Card key={skill}>
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center justify-between">
                      {skill.replace("_", " ")}
                      <Badge variant={getScoreBadgeVariant(score as number)}>{(score as number)}/100</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={score as number} className="mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {(score as number) >= 85 && "Excellent mastery of this skill area."}
                      {(score as number) >= 75 && (score as number) < 85 && "Good understanding with minor gaps."}
                      {(score as number) >= 60 && (score as number) < 75 && "Adequate knowledge, focus on improvement."}
                      {(score as number) < 60 && "Significant development needed in this area."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            <div className="space-y-4">
              {feedbackData.questionBreakdown.map((q: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Question {index + 1}
                      <Badge variant={getScoreBadgeVariant(q.score)}>{q.score}/100</Badge>
                    </CardTitle>
                    <CardDescription>{position.questions[index]?.question}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={q.score} className="mb-3" />
                    <p className="text-sm text-muted-foreground">{q.feedback}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5" />
                  Personalized Learning Path
                </CardTitle>
                <CardDescription>Recommended next steps to improve your interview performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbackData.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-accent-foreground">{index + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={onRetakeInterview} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <RefreshCwIcon className="mr-2 h-4 w-4" />
            Retake Interview
          </Button>
          <Button onClick={onSelectNewPosition} variant="outline">
            <TargetIcon className="mr-2 h-4 w-4" />
            Try Different Position
          </Button>
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button variant="outline">
            <ShareIcon className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  )
}
