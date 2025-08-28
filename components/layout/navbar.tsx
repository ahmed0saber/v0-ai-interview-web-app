"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useNavigate } from "react-router-dom"
import { LogOut, User, ShieldIcon } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleProfile = () => {
    navigate("/profile")
  }

  const handleAdmin = () => {
    navigate("/admin")
  }

  if (!user) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">AI Interview Platform</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleAdmin}>
            <ShieldIcon className="mr-2 h-4 w-4" />
            Admin Access
          </Button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">AI Interview Platform</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
          <Button variant="ghost" size="sm" onClick={handleProfile}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
