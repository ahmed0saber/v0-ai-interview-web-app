"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Video,
    AlertCircleIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PermissionProviderProps {
    hasPermissions: boolean
    permissionError: string
}

export default function PermissionProvider({ hasPermissions, permissionError }: PermissionProviderProps) {
    return (
        <div className={cn("min-h-screen bg-background flex items-center justify-center p-4", hasPermissions && "hidden")}>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl text-foreground">Camera & Microphone Access</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    {permissionError ? (
                        <Alert className="border-destructive/50 text-destructive">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>{permissionError}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                                    <Video className="h-8 w-8 text-accent" />
                                </div>
                            </div>
                            <p className="text-muted-foreground">
                                Please allow camera and microphone access to begin your interview with our AI interviewer.
                            </p>
                        </div>
                    )}
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        Retry Permissions
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
