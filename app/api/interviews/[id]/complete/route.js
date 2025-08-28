import { getCollection } from "../../../../../lib/database.js"
import { verifyToken } from "../../../../../lib/auth-middleware.js"
import { generateInterviewResults } from "../../../../../lib/gemini.js"
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
    const interview = await interviewsCollection.findOne({ _id: new ObjectId(id) })

    if (!interview) {
      return Response.json({ error: "Interview not found" }, { status: 404 })
    }

    if (interview.status === "completed") {
      return Response.json({ error: "Interview already completed" }, { status: 400 })
    }

    // Generate comprehensive results using Gemini
    const interviewData = {
      position: interview.positionTitle,
      questions: interview.questions,
      answers: interview.answers,
      scores: interview.scores,
    }

    const results = await generateInterviewResults(interviewData)

    // Calculate additional metrics
    const totalQuestions = interview.questions.length
    const averageScore = interview.scores.reduce((a, b) => a + b, 0) / interview.scores.length
    const duration = Math.round((new Date() - new Date(interview.startedAt)) / 1000 / 60) // minutes

    const finalResults = {
      ...results,
      totalQuestions,
      averageScore: Math.round(averageScore * 10) / 10,
      duration: `${duration} minutes`,
      completedAt: new Date(),
    }

    // Update interview record
    await interviewsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          results: finalResults,
          updatedAt: new Date(),
        },
      },
    )

    return Response.json({
      success: true,
      results: finalResults,
    })
  } catch (error) {
    return Response.json({ error: "Failed to complete interview" }, { status: 500 })
  }
}
