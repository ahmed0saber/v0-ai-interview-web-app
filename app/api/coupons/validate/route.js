import { getCollection } from "../../../../lib/database.js"

export async function POST(request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return Response.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const couponsCollection = await getCollection("coupons")
    const coupon = await couponsCollection.findOne({ code })

    if (!coupon) {
      return Response.json({ error: "Invalid coupon code" }, { status: 404 })
    }

    if (coupon.isUsed) {
      return Response.json({ error: "Coupon has already been used" }, { status: 400 })
    }

    if (new Date() > new Date(coupon.expiresAt)) {
      return Response.json({ error: "Coupon has expired" }, { status: 400 })
    }

    return Response.json({
      valid: true,
      coupon: {
        code: coupon.code,
        expiresAt: coupon.expiresAt,
      },
    })
  } catch (error) {
    return Response.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
