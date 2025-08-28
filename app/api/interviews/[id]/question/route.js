import { getCollection } from "../../../../../lib/database.js"
import { verifyToken } from "../../../../../lib/auth-middleware.js"
import { generateInterviewQuestion } from "../../../../../lib/gemini.js"
import { ObjectId } from "mongodb"

export async function POST(request, { params }) {
  const authResult = verifyToken(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid interview ID" }, { status: 400 })
    }

    const interviewsCollection = await getCollection("interview_records")
    const positionsCollection = await getCollection("positions")

    const interview = await interviewsCollection.findOne({ _id: new ObjectId(id) })
    if (!interview) {
      return Response.json({ error: "Interview not found" }, { status: 404 })
    }

    const position = await positionsCollection.findOne({ id: interview.positionId })
    if (!position) {
      return Response.json({ error: "Position not found" }, { status: 404 })
    }

    let selectedQuestion

    // Check if we have predefined questions left
    if (interview.currentQuestionIndex < position.questions.length) {
      selectedQuestion = position.questions[interview.currentQuestionIndex]
    } else {
      // Generate new question using Gemini
      try {
        const previousQuestions = interview.questions
        const newQuestionText = await generateInterviewQuestion(position.title, previousQuestions)

        selectedQuestion = {
          id: `generated-${Date.now()}`,
          question: newQuestionText,
          followUp: "Can you elaborate on your approach or provide more details?",
        }
      } catch (error) {
        return Response.json({ error: "Failed to generate question" }, { status: 500 })
      }
    }

    // Update interview with new question
    await interviewsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { questions: selectedQuestion.question },
        $set: { updatedAt: new Date() },
      },
    )

    return Response.json({
      success: true,
      question: selectedQuestion,
      questionIndex: interview.currentQuestionIndex,
    })
  } catch (error) {
    return Response.json({ error: "Failed to get next question" }, { status: 500 })
  }
}
