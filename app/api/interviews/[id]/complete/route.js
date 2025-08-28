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
      return Response.json({
        success: true,
        results: interview.results,
      })
    }

    // Generate comprehensive results using Gemini
    const interviewData = {
      position: interview.positionTitle,
      questions: interview.questions || [],
      answers: interview.answers || [],
      scores: interview.scores || [],
    }

    console.log("[v0] Generating results for interview:", interviewData)
    const aiResults = await generateInterviewResults(interviewData)
    console.log("[v0] Generated AI results:", aiResults)

    // Calculate additional metrics
    const totalQuestions = interview.questions?.length || 0
    const averageScore =
      interview.scores?.length > 0
        ? Math.round((interview.scores.reduce((a, b) => a + b, 0) / interview.scores.length) * 10) / 10
        : 0
    const duration = Math.round((new Date() - new Date(interview.startedAt)) / 1000 / 60) // minutes

    const finalResults = {
      ...aiResults,
      position: interview.positionTitle,
      totalQuestions,
      questionsAnswered: interview.answers?.length || 0,
      averageScore,
      duration,
      completedAt: new Date().toISOString(),
      interviewId: id,
      userId: interview.userId,
      startedAt: interview.startedAt,
    }

    console.log("[v0] Final results to save:", finalResults)

    // Update interview record with comprehensive results
    await interviewsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "completed",
          completedAt: new Date(),
          results: finalResults,
          overallScore: aiResults.overallScore,
          strengths: aiResults.strengths,
          improvements: aiResults.improvements,
          skillScores: aiResults.scores,
          updatedAt: new Date(),
        },
      },
    )

    console.log("[v0] Interview results saved successfully")

    return Response.json({
      success: true,
      results: finalResults,
    })
  } catch (error) {
    console.error("[v0] Error completing interview:", error)
    return Response.json({ error: "Failed to complete interview" }, { status: 500 })
  }
}
