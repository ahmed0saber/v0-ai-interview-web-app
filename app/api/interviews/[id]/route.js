import { getCollection } from "../../../../lib/database.js"
import { verifyToken } from "../../../../lib/auth-middleware.js"
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

    return Response.json({ interview })
  } catch (error) {
    return Response.json({ error: "Failed to fetch interview" }, { status: 500 })
  }
}
