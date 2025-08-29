"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { LogOut, User, ShieldIcon } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  if (!user) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between mx-auto py-1 px-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">
              <Link href="/">AI Interview Platform</Link>
            </h1>
          </div>
          <Link href="/admin" className="flex items-center gap-1 bg-gray-100 p-2 rounded-md">
            <ShieldIcon className="mr-2 h-4 w-4" />
            Admin Access
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto py-1 px-2">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">
            <Link href="/">AI Interview Platform</Link>
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/profile" className="flex items-center gap-1 bg-gray-100 p-2 rounded-md">
            <User className="mr-2 h-4 w-4" />
            {user?.name}
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
