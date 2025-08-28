"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface CouponRegistrationProps {
  onRegistrationSuccess: (userData: { email: string; name: string }) => void
}

export function CouponRegistration({ onRegistrationSuccess }: CouponRegistrationProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    couponCode: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const validateCoupon = async (code: string) => {
    // Mock API call - replace with actual API
    const response = await fetch("/api/coupons")
    const data = await response.json()

    const coupon = data.coupons.find((c: any) => c.code === code && !c.isUsed && new Date(c.expiresAt) > new Date())

    return coupon ? { valid: true, coupon } : { valid: false, coupon: null }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Validate coupon
      const { valid, coupon } = await validateCoupon(formData.couponCode)

      if (!valid) {
        setError("Invalid or expired coupon code. Please check your code and try again.")
        return
      }

      // Mock registration - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess("Registration successful! Welcome to AI Interview Platform.")

      // Call success callback after a brief delay
      setTimeout(() => {
        onRegistrationSuccess({
          email: formData.email,
          name: formData.name,
        })
      }, 1000)
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">Join AI Interview Platform</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your coupon code to create your account and start practicing interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="bg-input border-border focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-input border-border focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon" className="text-sm font-medium text-foreground">
                Coupon Code
              </Label>
              <Input
                id="coupon"
                type="text"
                placeholder="Enter your coupon code"
                value={formData.couponCode}
                onChange={(e) => handleInputChange("couponCode", e.target.value.toUpperCase())}
                required
                className="bg-input border-border focus:ring-ring font-mono"
              />
            </div>

            {error && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500/50 text-green-700 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading || !formData.name || !formData.email || !formData.couponCode}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have a coupon code? <span className="text-accent font-medium">Contact your administrator</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
