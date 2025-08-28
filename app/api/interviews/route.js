import { getCollection } from "../../../lib/database.js"
import { verifyToken } from "../../../lib/auth-middleware.js"
import { z } from "zod"

const startInterviewSchema = z.object({
  positionId: z.string().min(1),
  userId: z.string().min(1),
})

export async function POST(request) {
  const authResult = verifyToken(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const validatedData = startInterviewSchema.parse(body)

    const interviewsCollection = await getCollection("interview_records")
    const positionsCollection = await getCollection("positions")

    // Get position details
    const position = await positionsCollection.findOne({ id: validatedData.positionId })
    if (!position) {
      return Response.json({ error: "Position not found" }, { status: 404 })
    }

    // Create new interview session
    const newInterview = {
      userId: validatedData.userId,
      positionId: validatedData.positionId,
      positionTitle: position.title,
      status: "started",
      currentQuestionIndex: 0,
      questions: [],
      answers: [],
      scores: [],
      aiResponses: [],
      startedAt: new Date(),
      completedAt: null,
      results: null,
    }

    const result = await interviewsCollection.insertOne(newInterview)

    return Response.json(
      {
        success: true,
        interview: { ...newInterview, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return Response.json({ error: "Failed to start interview" }, { status: 500 })
  }
}

export async function GET(request) {
  const authResult = verifyToken(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    const interviewsCollection = await getCollection("interview_records")

    const query = userId ? { userId } : {}
    const interviews = await interviewsCollection.find(query).sort({ startedAt: -1 }).toArray()

    return Response.json({ interviews })
  } catch (error) {
    return Response.json({ error: "Failed to fetch interviews" }, { status: 500 })
  }
}
