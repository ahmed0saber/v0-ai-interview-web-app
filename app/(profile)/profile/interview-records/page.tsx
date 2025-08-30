"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"

interface InterviewRecord {
    id: string
    position: string
    score: number
    completedAt: string
    duration: number
    questionsAnswered: number
}

export default function InterviewRecordsPage() {
    const [interviewRecords, setInterviewRecords] = useState<InterviewRecord[] | null>(null)
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
                    setInterviewRecords(data.interviewRecords)
                }
            } catch (error) {
                console.error("Failed to load profile data:", error)
            } finally {
                setLoading(false)
            }
        }

        getProfile()
    }, [])

    if (!interviewRecords || loading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-x-2 p-4">
            <h1 className="text-xl font-bold">Your Interview Records</h1>
            {interviewRecords.length > 0 ? (
                <ul>
                    {interviewRecords.map((record) => (
                        <li key={record.id}>
                            {record.position} - Score: {record.score} - Completed At: {record.completedAt}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No interview records found.</p>
            )}
        </div>
    )
}
