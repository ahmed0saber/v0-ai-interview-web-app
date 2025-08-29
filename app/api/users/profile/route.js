import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-middleware"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const authResult = verifyToken(request)
    if (authResult.error) {
      return Response.json({ error: authResult.error }, { status: authResult.status })
    }

    const { db } = await connectToDatabase()
    const userId = authResult.user.userId

    // Get user data
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } })

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 })
    }

    // Get interview records for this user
    const interviewRecords = await db
      .collection("interview_records")
      .find({ userId: authResult.user.email })
      .sort({ completedAt: -1 })
      .limit(10)
      .toArray()

    // Calculate user statistics
    const stats = {
      totalInterviews: interviewRecords.length,
      averageScore:
        interviewRecords.length > 0
          ? interviewRecords.reduce((sum, record) => sum + (record.score || 0), 0) / interviewRecords.length
          : 0,
      totalDuration: interviewRecords.reduce((sum, record) => sum + (record.duration || 0), 0),
      favoritePosition: getFavoritePosition(interviewRecords),
    }

    // Format interview records for frontend
    const formattedRecords = interviewRecords.map((record) => ({
      id: record._id.toString(),
      position: record.position,
      score: record.score || 0,
      completedAt: record.completedAt,
      duration: record.duration || 0,
      questionsAnswered: record.questionsAnswered || 0,
    }))

    return Response.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        couponCode: user.couponCode,
        createdAt: user.createdAt,
      },
      interviewRecords: formattedRecords,
      stats,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

function getFavoritePosition(records) {
  if (records.length === 0) return "None"

  const positionCounts = {}
  records.forEach((record) => {
    positionCounts[record.position] = (positionCounts[record.position] || 0) + 1
  })

  return Object.keys(positionCounts).reduce((a, b) => (positionCounts[a] > positionCounts[b] ? a : b))
}
