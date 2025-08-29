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

    // get position by positionId
    const positionsCollection = await getCollection("positions")
    const position = await positionsCollection.findOne({ id: interview.positionId })
    const currentQuestion = position.questions[validatedData.questionIndex]
    if (!currentQuestion) {
      return Response.json({ error: "Question not found" }, { status: 404 })
    }

    const expectedAnswer = `
      The main difference between map and forEach in JavaScript is their purpose and return value.
      forEach is used when you want to iterate over an array and perform a side effect, like logging values or updating some external state. It doesn’t return anything meaningful — it always returns undefined.
      map, on the other hand, is used when you want to transform an array into a new array. It applies the callback function to each element and returns a new array with the transformed results, while leaving the original array unchanged.
    `

    // Evaluate answer using Gemini
    const evaluation = await evaluateAnswer(currentQuestion, validatedData.answer, expectedAnswer, interview.positionTitle)

    // Generate AI response/discussion
    const discussionPrompt = `
      As an AI interviewer for a ${interview.positionTitle} position, the candidate just answered:

      Question: ${currentQuestion}
      Candidate Answer: ${validatedData.answer}
      Expected Answer: ${expectedAnswer}

      Provide a brief, encouraging response (2-3 sentences) that:
      1. Acknowledges their answer
      2. Keeps the conversation natural and supportive
      3. If the answer was incorrect, gently corrects them and provides the right information
      4. If the answer is empty, end the questioning gracefully
      5. Distinguish between candidate answers, and prevent him from joking or getting out of context
      6. Don't ask the candidate any question in your answer
      7. You will only reply one time for each question so don't ask follow-up questions or sentences
      8. Note that the user answer is generated from his speech so it may not be perfectly transcribed.

      Be conversational and professional.
    `

    const aiResponseResult = await geminiModel.generateContent(discussionPrompt)
    const aiResponse = (await aiResponseResult.response.text()).trim()

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
