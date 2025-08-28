"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CaptionsDisplay } from "./captions-display"
import { SpeechManager } from "../../lib/speech.js"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  Clock,
  UserIcon,
  BotIcon,
  PlayIcon,
  SkipForwardIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  MessageSquare,
} from "lucide-react"

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

interface VideoInterviewProps {
  user: { email: string; name: string }
  position: Position
  onInterviewComplete: (results: any) => void
}

type InterviewPhase = "setup" | "intro" | "question" | "discussion" | "transition" | "complete"

export function VideoInterview({ user, position, onInterviewComplete }: VideoInterviewProps) {
  const [phase, setPhase] = useState<InterviewPhase>("setup")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentMessage, setCurrentMessage] = useState("")
  const [hasPermissions, setHasPermissions] = useState(false)
  const [permissionError, setPermissionError] = useState("")

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Interview script messages
  const messages = {
    setup: "Please allow camera and microphone access to begin your interview.",
    intro: `Hello ${user.name}! I'm your AI interviewer. Let's start with a brief introduction about yourself.`,
    question: "Here's your next technical question. Take your time to think through your answer.",
    discussion: "Great answer! Let me ask you a follow-up question to dive deeper.",
    transition: "Excellent! Let's move on to the next question.",
    complete: "That concludes our interview. Thank you for your time!",
  }

  const [speechManager] = useState(() => new SpeechManager())
  const [captions, setCaptions] = useState<
    Array<{
      id: string
      speaker: "ai" | "user"
      text: string
      timestamp: Date
      isInterim?: boolean
    }>
  >([])
  const [currentUserTranscript, setCurrentUserTranscript] = useState("")
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [captionsEnabled, setCaptionsEnabled] = useState(true)
  const [interviewId, setInterviewId] = useState<string | null>(null)

  // Request media permissions
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setHasPermissions(true)
        setCurrentMessage(messages.setup)
      } catch (error) {
        setPermissionError("Camera and microphone access is required for the interview.")
        console.error("Media permission error:", error)
      }
    }

    requestPermissions()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Timer for interview duration
  useEffect(() => {
    if (phase !== "setup" && phase !== "complete") {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [phase])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startInterview = async () => {
    try {
      // Create interview session via API
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          positionId: position.id,
          userId: user.email,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInterviewId(data.interview._id)
      }
    } catch (error) {
      console.error("Failed to start interview session:", error)
    }

    setPhase("intro")
    const introMessage = messages.intro
    setCurrentMessage(introMessage)
    await simulateAISpeaking(introMessage)

    // Start listening for user response
    startListening()
  }

  const startListening = () => {
    const success = speechManager.startListening(
      (finalTranscript, interimTranscript) => {
        setCurrentUserTranscript(interimTranscript)

        if (finalTranscript.trim()) {
          // Add user message to captions
          const userCaption = {
            id: `user-${Date.now()}`,
            speaker: "user" as const,
            text: finalTranscript.trim(),
            timestamp: new Date(),
          }
          setCaptions((prev) => [...prev, userCaption])
          setCurrentUserTranscript("")

          // Process the answer if we're in question phase
          if (phase === "question" && interviewId) {
            processUserAnswer(finalTranscript.trim())
          }
        }
      },
      () => {
        setIsUserSpeaking(false)
        setCurrentUserTranscript("")
      },
    )

    if (success) {
      setIsUserSpeaking(true)
      setIsRecording(true)
    }
  }

  const processUserAnswer = async (answer: string) => {
    if (!interviewId) return

    try {
      const response = await fetch(`/api/interviews/${interviewId}/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          answer,
          questionIndex: currentQuestionIndex,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // AI responds with evaluation and follow-up
        setTimeout(async () => {
          await simulateAISpeaking(data.aiResponse)

          // Continue to next phase after AI response
          setTimeout(() => {
            handlePhaseTransition()
          }, 1000)
        }, 1000)
      }
    } catch (error) {
      console.error("Failed to process answer:", error)
    }
  }

  const getNextQuestion = async () => {
    if (!interviewId) return null

    try {
      const response = await fetch(`/api/interviews/${interviewId}/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data.question
      }
    } catch (error) {
      console.error("Failed to get next question:", error)
    }

    return null
  }

  const handlePhaseTransition = async () => {
    switch (phase) {
      case "intro":
        setPhase("question")
        const question = await getNextQuestion()
        if (question) {
          const questionMessage = `${messages.question}\n\n${question.question}`
          setCurrentMessage(questionMessage)
          await simulateAISpeaking(question.question)
          startListening()
        }
        break
      case "question":
        setPhase("discussion")
        setCurrentMessage(messages.discussion)
        break
      case "discussion":
        if (currentQuestionIndex < position.questions.length - 1) {
          setPhase("transition")
          setCurrentMessage(messages.transition)
          await simulateAISpeaking(messages.transition)
          setTimeout(async () => {
            setCurrentQuestionIndex((prev) => prev + 1)
            setPhase("question")
            const nextQuestion = await getNextQuestion()
            if (nextQuestion) {
              const questionMessage = `${messages.question}\n\n${nextQuestion.question}`
              setCurrentMessage(questionMessage)
              await simulateAISpeaking(nextQuestion.question)
              startListening()
            }
          }, 2000)
        } else {
          await completeInterview()
        }
        break
    }
  }

  const completeInterview = async () => {
    setPhase("complete")
    const completeMessage = messages.complete
    setCurrentMessage(completeMessage)
    await simulateAISpeaking(completeMessage)

    if (interviewId) {
      try {
        const response = await fetch(`/api/interviews/${interviewId}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTimeout(() => {
            onInterviewComplete(data.results)
          }, 3000)
        }
      } catch (error) {
        console.error("Failed to complete interview:", error)
      }
    }
  }

  const simulateAISpeaking = async (message: string) => {
    setIsSpeaking(true)

    // Add AI message to captions
    const aiCaption = {
      id: `ai-${Date.now()}`,
      speaker: "ai" as const,
      text: message,
      timestamp: new Date(),
    }
    setCaptions((prev) => [...prev, aiCaption])

    try {
      // Use speech synthesis to make AI speak
      await speechManager.speak(message, {
        rate: 0.9,
        pitch: 1.0,
        volume: 0.8,
      })
    } catch (error) {
      console.error("Speech synthesis error:", error)
    } finally {
      setIsSpeaking(false)
    }
  }

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)

      if (!isMuted) {
        speechManager.stopListening()
        setIsUserSpeaking(false)
        setIsRecording(false)
      }
    }
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !isVideoOn
      })
      setIsVideoOn(!isVideoOn)
    }
  }

  const currentQuestion = position.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / position.questions.length) * 100

  if (!hasPermissions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-foreground">Camera & Microphone Access</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {permissionError ? (
              <Alert className="border-destructive/50 text-destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>{permissionError}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                    <Video className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  Please allow camera and microphone access to begin your interview with our AI interviewer.
                </p>
              </div>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Retry Permissions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{position.title} Interview</h1>
            <p className="text-muted-foreground">AI Interview Session with {user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(timeElapsed)}
            </Badge>
            <Badge variant="outline">
              Question {currentQuestionIndex + 1} of {position.questions.length}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        {phase !== "setup" && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Interview Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Video Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Video */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                {user.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                {!isVideoOn && (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <VideoOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant={isMuted ? "destructive" : "secondary"}
                    onClick={toggleMute}
                    className="h-8 w-8 p-0"
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={!isVideoOn ? "destructive" : "secondary"}
                    onClick={toggleVideo}
                    className="h-8 w-8 p-0"
                  >
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Interviewer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BotIcon className="h-5 w-5" />
                AI Interviewer
                {isSpeaking && (
                  <Badge variant="secondary" className="ml-2 animate-pulse">
                    Speaking...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gradient-to-br from-accent/20 to-secondary/20 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                      isSpeaking ? "scale-110 shadow-lg" : ""
                    }`}
                  >
                    <BotIcon className="h-10 w-10 text-accent-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">AI Interview Assistant</p>
                </div>
                <div className="absolute bottom-2 right-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interview Content with Captions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Message/Question */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    {phase === "setup" && "Getting Ready"}
                    {phase === "intro" && "Introduction"}
                    {phase === "question" && `Question ${currentQuestionIndex + 1}`}
                    {phase === "discussion" && "Follow-up Discussion"}
                    {phase === "transition" && "Moving Forward"}
                    {phase === "complete" && "Interview Complete"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCaptionsEnabled(!captionsEnabled)}
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Captions
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-foreground font-medium">{currentMessage}</p>
                </div>

                {phase === "question" && currentQuestion && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Technical Question:</h4>
                    <p className="text-card-foreground">{currentQuestion.question}</p>
                  </div>
                )}

                {phase === "discussion" && currentQuestion && (
                  <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Follow-up:</h4>
                    <p className="text-card-foreground">{currentQuestion.followUp}</p>
                  </div>
                )}

                <CaptionsDisplay
                  captions={captions}
                  isAISpeaking={isSpeaking}
                  isUserSpeaking={isUserSpeaking}
                  currentUserTranscript={currentUserTranscript}
                  onToggleCaptions={() => setCaptionsEnabled(!captionsEnabled)}
                  captionsEnabled={captionsEnabled}
                />
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interview Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {phase === "setup" && (
                  <Button
                    onClick={startInterview}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Start Interview
                  </Button>
                )}

                {(phase === "intro" || phase === "question" || phase === "discussion") && (
                  <>
                    <Button
                      onClick={handlePhaseTransition}
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      <SkipForwardIcon className="mr-2 h-4 w-4" />
                      Continue
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isRecording ? "destructive" : "secondary"}
                        onClick={() => {
                          if (isRecording) {
                            speechManager.stopListening()
                            setIsRecording(false)
                            setIsUserSpeaking(false)
                          } else {
                            startListening()
                          }
                        }}
                        className="flex-1"
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (speechManager.isSpeaking()) {
                            speechManager.stopSpeaking()
                          }
                        }}
                        className="flex-1"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}

                {phase === "complete" && (
                  <div className="text-center">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interview completed successfully!</p>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-2">Session Info</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Questions:</span>
                      <span>
                        {currentQuestionIndex + (phase === "complete" ? 1 : 0)} / {position.questions.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="capitalize">{phase}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
