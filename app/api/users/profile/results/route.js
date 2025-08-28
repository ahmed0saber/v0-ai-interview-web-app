import { getCollection } from "../../../../../lib/database.js"
import { verifyToken } from "../../../../../lib/auth-middleware.js"

export async function POST(request) {
  const authResult = verifyToken(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const { position, score, duration, questionsAnswered, completedAt, strengths, improvements } = body

    const interviewRecord = {
      userId: authResult.user.id,
      position,
      score,
      duration,
      questionsAnswered,
      completedAt: new Date(completedAt),
      strengths: strengths || [],
      improvements: improvements || [],
      createdAt: new Date(),
    }

    const interviewsCollection = await getCollection("interview_records")
    await interviewsCollection.insertOne(interviewRecord)

    return Response.json({ success: true })
  } catch (error) {
    console.error("Error saving interview results:", error)
    return Response.json({ error: "Failed to save results" }, { status: 500 })
  }
}
