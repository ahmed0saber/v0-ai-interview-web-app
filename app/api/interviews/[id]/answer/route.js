import { getCollection } from "../../../../../lib/database.js"
import { verifyToken } from "../../../../../lib/auth-middleware.js"
import { evaluateAnswer, geminiModel } from "../../../../../lib/gemini.js"
import { ObjectId } from "mongodb"
import { z } from "zod"

const submitAnswerSchema = z.object({
  answer: z.string().min(1),
  questionIndex: z.number().min(0),
})

export async function POST(request, { params }) {
  const authResult = verifyToken(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = params
    const body = await request.json()
    const validatedData = submitAnswerSchema.parse(body)

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid interview ID" }, { status: 400 })
    }

    const interviewsCollection = await getCollection("interview_records")
    const interview = await interviewsCollection.findOne({ _id: new ObjectId(id) })

    if (!interview) {
      return Response.json({ error: "Interview not found" }, { status: 404 })
    }

    const currentQuestion = interview.questions[validatedData.questionIndex]
    if (!currentQuestion) {
      return Response.json({ error: "Question not found" }, { status: 404 })
    }

    // Evaluate answer using Gemini
    const evaluation = await evaluateAnswer(currentQuestion, validatedData.answer, interview.positionTitle)

    // Generate AI response/discussion
    const discussionPrompt = `
      As an AI interviewer for a ${interview.positionTitle} position, the candidate just answered:
      
      Question: ${currentQuestion}
      Answer: ${validatedData.answer}
      
      Provide a brief, encouraging response (2-3 sentences) that:
      1. Acknowledges their answer
      2. Asks a relevant follow-up question or requests clarification
      3. Keeps the conversation natural and supportive
      
      Be conversational and professional.
    `

    const aiResponseResult = await geminiModel.generateContent(discussionPrompt)
    const aiResponse = aiResponseResult.response.text().trim()

    // Update interview record
    await interviewsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: {
          answers: validatedData.answer,
          scores: evaluation.score,
          aiResponses: aiResponse,
        },
        $inc: { currentQuestionIndex: 1 },
        $set: { updatedAt: new Date() },
      },
    )

    return Response.json({
      success: true,
      evaluation,
      aiResponse,
      nextQuestionIndex: interview.currentQuestionIndex + 1,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return Response.json({ error: "Failed to process answer" }, { status: 500 })
  }
}
