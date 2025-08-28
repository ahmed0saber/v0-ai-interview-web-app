import { getCollection } from "../../../lib/database.js"
import { z } from "zod"

const createCouponSchema = z.object({
  code: z.string().min(3).max(20),
  expiresAt: z.string().datetime(),
  createdBy: z.string().optional().default("admin"),
})

export async function GET() {
  try {
    const couponsCollection = await getCollection("coupons")
    const coupons = await couponsCollection.find({}).toArray()

    return Response.json({ coupons })
  } catch (error) {
    return Response.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validatedData = createCouponSchema.parse(body)

    const couponsCollection = await getCollection("coupons")

    // Check if coupon code already exists
    const existingCoupon = await couponsCollection.findOne({ code: validatedData.code })
    if (existingCoupon) {
      return Response.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const newCoupon = {
      ...validatedData,
      isUsed: false,
      usedBy: null,
      usedAt: null,
      createdAt: new Date(),
      expiresAt: new Date(validatedData.expiresAt),
    }

    const result = await couponsCollection.insertOne(newCoupon)

    return Response.json(
      {
        success: true,
        coupon: { ...newCoupon, _id: result.insertedId },
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return Response.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
