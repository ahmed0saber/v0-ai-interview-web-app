"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

interface Profile {
    user: {
        id: string
        name: string
        email: string
        createdAt: string
    }
    interviewRecords: Array<{
        id: string
        position: string
        score: number
        completedAt: string
        duration: number
        questionsAnswered: number
    }>
    stats: {
        totalInterviews: number
        averageScore: number
        totalDuration: number
        favoritePosition: string
    }
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    // useEffect to get profile data with auth token
    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await fetch("/api/users/profile", {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                    },
                })

                if (response.ok) {
                    const data = await response.json()
                    setProfile(data)
                }
            } catch (error) {
                console.error("Failed to load profile data:", error)
            } finally {
                setLoading(false)
            }
        }

        getProfile()
    }, [])

    if (!profile || loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-x-2 p-4">
            <h1 className="text-xl font-bold">Hello, {profile.user.name}!</h1>
            <p>Email: {profile.user.email}</p>
            <p className="text-md text-muted-foreground">Welcome to your profile page.</p>

            <h2 className="text-lg font-bold">Your Interview Statistics</h2>
            <ul>
                <li>Total Interviews: {profile.stats.totalInterviews}</li>
                <li>Average Score: {profile.stats.averageScore}</li>
                <li>Total Duration: {profile.stats.totalDuration}</li>
                <li>Favorite Position: {profile.stats.favoritePosition}</li>
            </ul>

            <h2 className="text-lg font-bold">Your Interview Records</h2>
            {profile.interviewRecords.length > 0 ? (
                <>
                    <ul>
                        {profile.interviewRecords.map((record) => (
                            <li key={record.id}>
                                {record.position} - Score: {record.score} - Completed At: {record.completedAt}
                            </li>
                        ))}
                    </ul>
                    <Link href="/profile/interview-records">
                        <Button variant="outline" className="mt-4">
                            View All Records
                        </Button>
                    </Link>
                </>
            ) : (
                <p>No interview records found.</p>
            )}
        </div>
    )
}
