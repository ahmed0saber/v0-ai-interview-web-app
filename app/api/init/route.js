import { initializeDatabase, seedDatabase } from "../../../lib/database.js"

export async function POST() {
  try {
    await initializeDatabase()
    await seedDatabase()

    return Response.json({
      success: true,
      message: "Database initialized and seeded successfully",
    })
  } catch (error) {
    console.error("Database initialization error:", error)
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
