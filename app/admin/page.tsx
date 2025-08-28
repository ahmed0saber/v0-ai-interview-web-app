"use client"

import { useState } from "react"
import { AdminLogin } from "@/components/admin/admin-login"
import { CouponDashboard } from "@/components/admin/coupon-dashboard"

interface Admin {
  email: string
  role: string
}

export default function AdminPage() {
  const [admin, setAdmin] = useState<Admin | null>(null)

  const handleAdminLogin = (adminData: Admin) => {
    setAdmin(adminData)
  }

  const handleLogout = () => {
    setAdmin(null)
  }

  if (!admin) {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />
  }

  return <CouponDashboard admin={admin} onLogout={handleLogout} />
}
