"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess("")

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Login failed. Please try again.")
                return
            }

            localStorage.setItem("auth_token", data.token)
            login(data.user)

            setSuccess("Login successful! Welcome to AI Interview Platform.")

            setTimeout(() => {
                window.location.href = "/"
            }, 1000)
        } catch (err) {
            setError("Login failed. Please try again.")
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
                            <Label htmlFor="password" className="text-sm font-medium text-foreground">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
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

                        {success && (
                            <Alert className="border-green-500/50 text-green-700 bg-green-50">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isLoading || !formData.email || !formData.password}
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
                            Don't have an account? <Link href="/register" className="text-accent font-medium">Sign up here</Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
