"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  LogOutIcon,
  TicketIcon,
  UsersIcon,
  TrendingUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CopyIcon,
} from "lucide-react"

interface Admin {
  username: string
  role: string
}

interface Coupon {
  id: string
  code: string
  isUsed: boolean
  usedBy?: string
  usedAt?: string
  createdBy: string
  createdAt: string
  expiresAt: string
}

interface CouponDashboardProps {
  admin: Admin
  onLogout: () => void
}

export function CouponDashboard({ admin, onLogout }: CouponDashboardProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newCouponData, setNewCouponData] = useState({
    code: "",
    expiresAt: "",
  })
  const [stats, setStats] = useState({
    total: 0,
    used: 0,
    active: 0,
    expired: 0,
  })

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetch("/api/coupons")
        const data = await response.json()
        setCoupons(data.coupons)

        // Calculate stats
        const now = new Date()
        const total = data.coupons.length
        const used = data.coupons.filter((c: Coupon) => c.isUsed).length
        const expired = data.coupons.filter((c: Coupon) => new Date(c.expiresAt) < now && !c.isUsed).length
        const active = total - used - expired

        setStats({ total, used, active, expired })
      } catch (error) {
        console.error("Failed to load coupons:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCoupons()
  }, [])

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreateCoupon = async () => {
    if (!newCouponData.code || !newCouponData.expiresAt) return

    const newCoupon: Coupon = {
      id: `COUP${String(coupons.length + 1).padStart(3, "0")}`,
      code: newCouponData.code,
      isUsed: false,
      createdBy: admin.username,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(newCouponData.expiresAt).toISOString(),
    }

    // Mock API call - in real app, this would save to backend
    setCoupons((prev) => [...prev, newCoupon])
    setStats((prev) => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }))

    setNewCouponData({ code: "", expiresAt: "" })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId))
    setStats((prev) => ({ ...prev, total: prev.total - 1, active: prev.active - 1 }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (coupon.isUsed) return { label: "Used", variant: "secondary" as const }
    if (new Date(coupon.expiresAt) < new Date()) return { label: "Expired", variant: "destructive" as const }
    return { label: "Active", variant: "default" as const }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <TicketIcon className="h-8 w-8 text-accent" />
          </div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {admin.username}</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            <LogOutIcon className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Coupons</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <TicketIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Coupons</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Used Coupons</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.used}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="coupons" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="coupons">Coupon Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Coupon</DialogTitle>
                  <DialogDescription>Generate a new coupon code for user registration</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coupon-code">Coupon Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coupon-code"
                        value={newCouponData.code}
                        onChange={(e) => setNewCouponData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        placeholder="Enter coupon code"
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setNewCouponData((prev) => ({ ...prev, code: generateCouponCode() }))}
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires-at">Expiration Date</Label>
                    <Input
                      id="expires-at"
                      type="date"
                      value={newCouponData.expiresAt}
                      onChange={(e) => setNewCouponData((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCoupon} disabled={!newCouponData.code || !newCouponData.expiresAt}>
                      Create Coupon
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="coupons">
            <Card>
              <CardHeader>
                <CardTitle>Coupon Management</CardTitle>
                <CardDescription>View and manage all coupon codes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Used By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => {
                      const status = getCouponStatus(coupon)
                      return (
                        <TableRow key={coupon.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm bg-muted px-2 py-1 rounded">{coupon.code}</code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(coupon.code)}
                                className="h-6 w-6 p-0"
                              >
                                <CopyIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>{coupon.usedBy || "-"}</TableCell>
                          <TableCell>{formatDate(coupon.createdAt)}</TableCell>
                          <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <EditIcon className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <TrashIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5" />
                    Usage Analytics
                  </CardTitle>
                  <CardDescription>Coupon usage statistics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <CalendarIcon className="h-4 w-4" />
                      <AlertDescription>
                        Analytics dashboard would show detailed usage patterns, registration trends, and performance
                        metrics in a production environment.
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">Usage Rate</h4>
                        <p className="text-2xl font-bold text-accent">
                          {stats.total > 0 ? Math.round((stats.used / stats.total) * 100) : 0}%
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">Active Rate</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-medium text-foreground mb-2">Expiry Rate</h4>
                        <p className="text-2xl font-bold text-red-600">
                          {stats.total > 0 ? Math.round((stats.expired / stats.total) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
