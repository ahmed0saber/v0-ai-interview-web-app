"use client"

import { useState } from "react"
import { AdminLogin } from "@/components/admin/admin-login"
import { CouponDashboard } from "@/components/admin/coupon-dashboard"
import { PositionDashboard } from "@/components/admin/position-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOutIcon } from "lucide-react"

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
    localStorage.removeItem("adminToken")
  }

  if (!admin) {
    return <AdminLogin onLoginSuccess={handleAdminLogin} />
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {admin.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="coupons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coupons">Coupon Management</TabsTrigger>
            <TabsTrigger value="positions">Position Management</TabsTrigger>
          </TabsList>

          <TabsContent value="coupons">
            <CouponDashboard />
          </TabsContent>

          <TabsContent value="positions">
            <PositionDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
