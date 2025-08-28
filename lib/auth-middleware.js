import jwt from "jsonwebtoken"

export function verifyToken(request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "No token provided", status: 401 }
  }

  const token = authHeader.substring(7)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    return { user: decoded }
  } catch (error) {
    return { error: "Invalid token", status: 401 }
  }
}

export function verifyAdmin(request) {
  const tokenResult = verifyToken(request)

  if (tokenResult.error) {
    return tokenResult
  }

  if (tokenResult.user.role !== "admin") {
    return { error: "Admin access required", status: 403 }
  }

  return { user: tokenResult.user }
}
