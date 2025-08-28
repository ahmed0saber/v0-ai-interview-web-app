import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
})

export async function generateInterviewQuestion(position, previousQuestions = []) {
  const prompt = `
    You are an AI interviewer for a ${position} position. 
    Generate a technical interview question that hasn't been asked yet.
    Previous questions: ${previousQuestions.join(", ")}
    
    Return only the question, no additional text.
  `

  const result = await geminiModel.generateContent(prompt)
  return result.response.text().trim()
}

export async function evaluateAnswer(question, answer, position) {
  const prompt = `
    As an AI interviewer for a ${position} position, evaluate this answer:
    
    Question: ${question}
    Answer: ${answer}
    
    Provide a score from 1-10 and brief feedback (2-3 sentences).
    Format: {"score": X, "feedback": "..."}
  `

  const result = await geminiModel.generateContent(prompt)
  try {
    return JSON.parse(result.response.text().trim())
  } catch {
    return { score: 5, feedback: "Unable to evaluate answer properly." }
  }
}

export async function generateInterviewResults(interviewData) {
  const { position, questions, answers, scores } = interviewData

  const prompt = `
    Generate comprehensive interview results for a ${position} candidate.
    
    Questions and Scores: ${questions.map((q, i) => `Q${i + 1}: ${q} (Score: ${scores[i]}/10)`).join("\n")}
    
    Provide:
    1. Overall performance summary
    2. Strengths identified
    3. Areas for improvement
    4. Specific recommendations
    5. Overall score (1-10)
    
    Format as JSON: {
      "overallScore": X,
      "summary": "...",
      "strengths": ["...", "..."],
      "improvements": ["...", "..."],
      "recommendations": ["...", "..."]
    }
  `

  const result = await geminiModel.generateContent(prompt)
  try {
    return JSON.parse(result.response.text().trim())
  } catch {
    return {
      overallScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      summary: "Interview completed successfully.",
      strengths: ["Good communication"],
      improvements: ["Technical depth"],
      recommendations: ["Practice more technical questions"],
    }
  }
}
