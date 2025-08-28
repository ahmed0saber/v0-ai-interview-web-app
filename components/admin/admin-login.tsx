"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ShieldIcon, AlertCircle } from "lucide-react"

interface AdminLoginProps {
  onLoginSuccess: (admin: { email: string; role: string }) => void
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store admin token for subsequent requests
        localStorage.setItem("adminToken", data.token)
        onLoginSuccess({
          email: data.admin.email,
          role: data.admin.role,
        })
      } else {
        setError(data.error || "Invalid email or password")
      }
    } catch (err) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setCredentials((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
              <ShieldIcon className="h-8 w-8 text-accent" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">Admin Access</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to manage coupons and user registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter admin email"
                value={credentials.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-input border-border focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter admin password"
                value={credentials.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="bg-input border-border focus:ring-ring"
              />
            </div>

            {error && (
              <Alert className="border-destructive/50 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isLoading || !credentials.email || !credentials.password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">Demo credentials: admin@interview.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
