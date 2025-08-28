import { getCollection } from "../../../../lib/database.js"
import { z } from "zod"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const usersCollection = await getCollection("users")

    // Find user
    const user = await usersCollection.findOne({ email: validatedData.email })
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)
    if (!isValidPassword) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Return user without password
    const { password, ...userWithoutPassword } = user

    return Response.json({
      success: true,
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return Response.json({ error: "Failed to login" }, { status: 500 })
  }
}
