import { getCollection } from "../../../../lib/database.js"
import { z } from "zod"
import bcrypt from "bcryptjs"

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  couponCode: z.string().min(3),
})

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const usersCollection = await getCollection("users")
    const couponsCollection = await getCollection("coupons")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: validatedData.email })
    if (existingUser) {
      return Response.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Validate coupon
    const coupon = await couponsCollection.findOne({ code: validatedData.couponCode })
    if (!coupon) {
      return Response.json({ error: "Invalid coupon code" }, { status: 400 })
    }

    if (coupon.isUsed) {
      return Response.json({ error: "Coupon has already been used" }, { status: 400 })
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return Response.json({ error: "Coupon has expired" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Create user
    const newUser = {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      couponUsed: validatedData.couponCode,
      createdAt: new Date(),
      role: "user",
    }

    const userResult = await usersCollection.insertOne(newUser)

    // Mark coupon as used
    await couponsCollection.updateOne(
      { code: validatedData.couponCode },
      {
        $set: {
          isUsed: true,
          usedBy: validatedData.email,
          usedAt: new Date(),
        },
      },
    )

    // Return user without password
    const { password, ...userWithoutPassword } = newUser

    return Response.json(
      {
        success: true,
        user: { ...userWithoutPassword, _id: userResult.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return Response.json({ error: "Failed to register user" }, { status: 500 })
  }
}
