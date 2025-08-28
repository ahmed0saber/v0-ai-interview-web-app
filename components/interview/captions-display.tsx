"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BotIcon, UserIcon, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Caption {
  id: string
  speaker: "ai" | "user"
  text: string
  timestamp: Date
  isInterim?: boolean
}

interface CaptionsDisplayProps {
  captions: Caption[]
  isAISpeaking: boolean
  isUserSpeaking: boolean
  currentUserTranscript?: string
  onToggleCaptions?: () => void
  captionsEnabled?: boolean
}

export function CaptionsDisplay({
  captions,
  isAISpeaking,
  isUserSpeaking,
  currentUserTranscript = "",
  onToggleCaptions,
  captionsEnabled = true,
}: CaptionsDisplayProps) {
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    if (autoScroll) {
      const captionsContainer = document.getElementById("captions-container")
      if (captionsContainer) {
        captionsContainer.scrollTop = captionsContainer.scrollHeight
      }
    }
  }, [captions, currentUserTranscript, autoScroll])

  if (!captionsEnabled) {
    return null
  }

  return (
    <Card className="h-64">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Live Captions
          </h4>
          <div className="flex items-center gap-2">
            {onToggleCaptions && (
              <Button size="sm" variant="ghost" onClick={onToggleCaptions} className="h-6 px-2">
                <VolumeX className="h-3 w-3" />
              </Button>
            )}
            <Badge
              variant={autoScroll ? "default" : "secondary"}
              className="text-xs cursor-pointer"
              onClick={() => setAutoScroll(!autoScroll)}
            >
              Auto-scroll
            </Badge>
          </div>
        </div>

        <div
          id="captions-container"
          className="h-48 overflow-y-auto space-y-2 bg-muted/30 rounded-lg p-3"
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
            setAutoScroll(scrollTop + clientHeight >= scrollHeight - 10)
          }}
        >
          {captions.map((caption) => (
            <div
              key={caption.id}
              className={`flex gap-2 ${caption.speaker === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[80%] ${
                  caption.speaker === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    caption.speaker === "ai" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {caption.speaker === "ai" ? <BotIcon className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 ${
                    caption.speaker === "ai" ? "bg-accent/20 text-foreground" : "bg-primary/20 text-foreground"
                  }`}
                >
                  <p className="text-sm">{caption.text}</p>
                  <span className="text-xs text-muted-foreground">
                    {caption.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Current AI speaking indicator */}
          {isAISpeaking && (
            <div className="flex gap-2 justify-start">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center flex-shrink-0">
                  <BotIcon className="h-3 w-3" />
                </div>
                <div className="bg-accent/20 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-accent rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">AI is speaking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current user speaking/transcript */}
          {(isUserSpeaking || currentUserTranscript) && (
            <div className="flex gap-2 justify-end">
              <div className="flex items-start gap-2 flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-3 w-3" />
                </div>
                <div className="bg-primary/20 rounded-lg px-3 py-2 max-w-[80%]">
                  {currentUserTranscript ? (
                    <p className="text-sm text-foreground/80 italic">
                      {currentUserTranscript}
                      <span className="inline-block w-2 h-4 bg-primary/60 ml-1 animate-pulse"></span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-pulse"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">Listening...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
