import { getCollection } from "../../../../lib/database.js"
import { verifyAdmin } from "../../../../lib/auth-middleware.js"
import { z } from "zod"

const updatePositionSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  level: z.string().min(3).max(50).optional(),
  duration: z.string().min(3).max(20).optional(),
  questions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string().min(10),
        followUp: z.string().min(10),
      }),
    )
    .min(1)
    .optional(),
})

export async function GET(request, { params }) {
  try {
    const { id } = params
    const positionsCollection = await getCollection("positions")

    const position = await positionsCollection.findOne({ id })

    if (!position) {
      return Response.json({ error: "Position not found" }, { status: 404 })
    }

    return Response.json({ position })
  } catch (error) {
    return Response.json({ error: "Failed to fetch position" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const authResult = verifyAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updatePositionSchema.parse(body)

    const positionsCollection = await getCollection("positions")

    const result = await positionsCollection.updateOne(
      { id },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
          updatedBy: authResult.user.email,
        },
      },
    )

    if (result.matchedCount === 0) {
      return Response.json({ error: "Position not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return Response.json({ error: "Failed to update position" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const authResult = verifyAdmin(request)
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = params
    const positionsCollection = await getCollection("positions")

    const result = await positionsCollection.deleteOne({ id })

    if (result.deletedCount === 0) {
      return Response.json({ error: "Position not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete position" }, { status: 500 })
  }
}
