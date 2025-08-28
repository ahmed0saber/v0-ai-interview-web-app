"use client"

import type React from "react"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/layout/navbar"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"
import { PositionsPage } from "@/pages/positions"
import { InterviewPage } from "@/pages/interview"
import { ResultsPage } from "@/pages/results"
import { ProfilePage } from "@/pages/profile"
import AdminPage from "./admin/page"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/positions" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/positions" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/positions" replace /> : <RegisterPage />} />
        <Route
          path="/positions"
          element={
            <ProtectedRoute>
              <PositionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <ResultsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}

export default function HomePage() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}
