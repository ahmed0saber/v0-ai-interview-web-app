import { getCollection } from "../../../lib/database.js"
import { verifyAdmin } from "../../../lib/auth-middleware.js"
import { z } from "zod"

const createPositionSchema = z.object({
  id: z.string().min(3).max(50),
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  level: z.string().min(3).max(50),
  duration: z.string().min(3).max(20),
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string().min(10),
        followUp: z.string().min(10),
      }),
    )
    .min(1),
})

export async function GET() {
  try {
    const positionsCollection = await getCollection("positions")
    const positions = await positionsCollection.find({}).toArray()

    return Response.json({ positions })
  } catch (error) {
    return Response.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}

export async function POST(request) {
  const authResult = verifyAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const validatedData = createPositionSchema.parse(body)

    const positionsCollection = await getCollection("positions")

    // Check if position ID already exists
    const existingPosition = await positionsCollection.findOne({ id: validatedData.id })
    if (existingPosition) {
      return Response.json({ error: "Position ID already exists" }, { status: 400 })
    }

    const newPosition = {
      ...validatedData,
      createdAt: new Date(),
      createdBy: authResult.user.email,
    }

    const result = await positionsCollection.insertOne(newPosition)

    return Response.json(
      {
        success: true,
        position: { ...newPosition, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return Response.json({ error: "Failed to create position" }, { status: 500 })
  }
}
