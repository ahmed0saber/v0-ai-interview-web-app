// Speech Synthesis utilities for AI voice
export class SpeechManager {
  constructor() {
    this.synthesis = window.speechSynthesis
    this.recognition = null
    this.isListening = false
    this.onTranscriptCallback = null
    this.onSpeechEndCallback = null
  }

  // Initialize speech recognition
  initSpeechRecognition() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported")
      return false
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = "en-US"

    this.recognition.onresult = (event) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (this.onTranscriptCallback) {
        this.onTranscriptCallback(finalTranscript, interimTranscript)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      if (this.onSpeechEndCallback) {
        this.onSpeechEndCallback()
      }
    }

    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      this.isListening = false
    }

    return true
  }

  // Start listening for user speech
  startListening(onTranscript, onSpeechEnd) {
    if (!this.recognition) {
      if (!this.initSpeechRecognition()) {
        return false
      }
    }

    this.onTranscriptCallback = onTranscript
    this.onSpeechEndCallback = onSpeechEnd

    try {
      this.recognition.start()
      this.isListening = true
      return true
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      return false
    }
  }

  // Stop listening
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  // Make AI speak text
  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Configure voice settings
      utterance.rate = options.rate || 0.9
      utterance.pitch = options.pitch || 1.0
      utterance.volume = options.volume || 0.8

      // Try to use a professional-sounding voice
      const voices = this.synthesis.getVoices()
      const preferredVoice = voices.find(
        (voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.lang.startsWith("en"),
      )

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onend = () => resolve()
      utterance.onerror = (error) => reject(error)

      this.synthesis.speak(utterance)
    })
  }

  // Stop AI speech
  stopSpeaking() {
    this.synthesis.cancel()
  }

  // Check if currently speaking
  isSpeaking() {
    return this.synthesis.speaking
  }

  // Get available voices
  getVoices() {
    return this.synthesis.getVoices()
  }
}
