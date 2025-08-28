import jwt from "jsonwebtoken"

const ADMIN_CREDENTIALS = {
  email: "admin@interview.com",
  password: "admin123", // In production, this should be hashed and stored securely
}

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return Response.json({ error: "Invalid admin credentials" }, { status: 401 })
    }

    // Generate admin JWT token
    const token = jwt.sign(
      {
        email: email,
        role: "admin",
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" },
    )

    return Response.json({
      success: true,
      admin: { email, role: "admin" },
      token,
    })
  } catch (error) {
    return Response.json({ error: "Failed to authenticate admin" }, { status: 500 })
  }
}
