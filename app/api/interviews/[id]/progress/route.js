import { getCollection } from "../../../../../lib/database.js"
import { verifyToken } from "../../../../../lib/auth-middleware.js"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
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

    const progress = {
      currentQuestionIndex: interview.currentQuestionIndex,
      totalQuestions: interview.questions.length,
      answeredQuestions: interview.answers.length,
      status: interview.status,
      startedAt: interview.startedAt,
      duration: Math.round((new Date() - new Date(interview.startedAt)) / 1000 / 60),
    }

    return Response.json({ progress })
  } catch (error) {
    return Response.json({ error: "Failed to get interview progress" }, { status: 500 })
  }
}
