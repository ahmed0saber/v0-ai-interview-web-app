import { getCollection } from "../../../../lib/database.js"
import { ObjectId } from "mongodb"

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid coupon ID" }, { status: 400 })
    }

    const couponsCollection = await getCollection("coupons")
    const result = await couponsCollection.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return Response.json({ error: "Coupon not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updates = await request.json()

    if (!ObjectId.isValid(id)) {
      return Response.json({ error: "Invalid coupon ID" }, { status: 400 })
    }

    const couponsCollection = await getCollection("coupons")
    const result = await couponsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return Response.json({ error: "Coupon not found" }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}
