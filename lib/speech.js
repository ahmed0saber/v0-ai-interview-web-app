// Speech Synthesis utilities for AI voice
export class SpeechManager {
  constructor(window) {
    this.synthesis = window.speechSynthesis
    this.recognition = null
    this.isListening = false
    this.onTranscriptCallback = null
    this.onSpeechEndCallback = null
    this.voicesLoaded = false
    this.preferredVoice = null
    this.loadVoices()
  }

  loadVoices() {
    const loadVoicesHandler = () => {
      const voices = this.synthesis.getVoices()
      this.preferredVoice = voices[0]
      this.voicesLoaded = true
    }

    // Load voices immediately if available
    if (this.synthesis.getVoices().length > 0) {
      loadVoicesHandler()
    } else {
      // Wait for voices to load
      this.synthesis.addEventListener("voiceschanged", loadVoicesHandler)
    }
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
    this.recognition.maxAlternatives = 1

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
      if (event.error === "no-speech" || event.error === "audio-capture") {
        setTimeout(() => {
          if (this.onTranscriptCallback) {
            this.startListening(this.onTranscriptCallback, this.onSpeechEndCallback)
          }
        }, 1000)
      }
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

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis.cancel()

      // remove any ` and * from the text
      const modifiedText = text.replace(/`/g, "").replace(/\*/g, "")

      const chunks = this.splitTextIntoChunks(modifiedText, 200)
      let currentChunk = 0

      const speakChunk = () => {
        if (currentChunk >= chunks.length) {
          resolve()
          return
        }

        const utterance = new SpeechSynthesisUtterance(chunks[currentChunk])

        // Configure voice settings
        utterance.rate = options.rate || 0.95
        utterance.pitch = options.pitch || 1.1
        utterance.volume = options.volume || 1

        // Use preferred voice if available
        if (this.preferredVoice) {
          utterance.voice = this.preferredVoice
        }

        utterance.onend = () => {
          currentChunk++
          setTimeout(speakChunk, 100)
        }

        utterance.onerror = (error) => {
          console.error("Speech synthesis error:", error)
          reject(error)
        }

        this.synthesis.speak(utterance)
      }

      speakChunk()
    })
  }

  splitTextIntoChunks(text, maxLength) {
    if (text.length <= maxLength) {
      return [text]
    }

    const chunks = []
    const sentences = text.split(/[.!?]+/)
    let currentChunk = ""

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += sentence + ". "
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
        }
        currentChunk = sentence + ". "
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }

    return chunks.filter((chunk) => chunk.length > 0)
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

  getPreferredVoice() {
    return this.preferredVoice
  }
}
