"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XIcon,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Position {
  _id: string
  id: string
  title: string
  description: string
  level: string
  duration: number
  questions: Array<{
    question: string
    followUp: string
  }>
  createdBy: string
  createdAt: string
  updatedAt: string
}

export function PositionDashboard() {
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [newPositionData, setNewPositionData] = useState({
    id: "",
    title: "",
    description: "",
    level: "",
    duration: 45,
    questions: [{ id: "0", question: "", followUp: "" }],
  })

  useEffect(() => {
    loadPositions()
  }, [])

  const loadPositions = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/positions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load positions")
      }

      const data = await response.json()
      setPositions(data.positions || [])
    } catch (error) {
      console.error("Failed to load positions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePosition = async () => {
    if (!newPositionData.id || !newPositionData.title || !newPositionData.description) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPositionData),
      })

      if (!response.ok) {
        throw new Error("Failed to create position")
      }

      const data = await response.json()
      setPositions((prev) => [...prev, data.position])

      // Reset form
      setNewPositionData({
        id: "",
        title: "",
        description: "",
        level: "",
        duration: 45,
        questions: [{ id: "0", question: "", followUp: "" }],
      })
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Failed to create position:", error)
    }
  }

  const handleEditPosition = async () => {
    if (!editingPosition) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/positions/${editingPosition.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingPosition.title,
          description: editingPosition.description,
          level: editingPosition.level,
          duration: editingPosition.duration,
          questions: editingPosition.questions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update position")
      }

      const data = await response.json()
      setPositions((prev) => prev.map((p) => (p.id === editingPosition.id ? data.position : p)))
      setIsEditDialogOpen(false)
      setEditingPosition(null)
    } catch (error) {
      console.error("Failed to update position:", error)
    }
  }

  const handleDeletePosition = async (positionId: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return

    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch(`/api/positions/${positionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete position")
      }

      setPositions((prev) => prev.filter((p) => p.id !== positionId))
    } catch (error) {
      console.error("Failed to delete position:", error)
    }
  }

  const addQuestion = (isEditing = false) => {
    if (isEditing && editingPosition) {
      setEditingPosition({
        ...editingPosition,
        questions: [...editingPosition.questions, { question: "", followUp: "" }],
      })
    } else {
      setNewPositionData((prev) => ({
        ...prev,
        questions: [...prev.questions, { id: String(prev.questions.length), question: "", followUp: "" }],
      }))
    }
  }

  const removeQuestion = (index: number, isEditing = false) => {
    if (isEditing && editingPosition) {
      setEditingPosition({
        ...editingPosition,
        questions: editingPosition.questions.filter((_, i) => i !== index),
      })
    } else {
      setNewPositionData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }))
    }
  }

  const updateQuestion = (index: number, field: "question" | "followUp", value: string, isEditing = false) => {
    if (isEditing && editingPosition) {
      const updatedQuestions = [...editingPosition.questions]
      updatedQuestions[index][field] = value
      setEditingPosition({
        ...editingPosition,
        questions: updatedQuestions,
      })
    } else {
      const updatedQuestions = [...newPositionData.questions]
      updatedQuestions[index][field] = value
      setNewPositionData((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getLevelBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "junior":
        return "secondary"
      case "mid-level":
        return "default"
      case "senior":
        return "destructive"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BriefcaseIcon className="h-8 w-8 text-accent" />
          </div>
          <p className="text-muted-foreground">Loading position dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Positions</p>
                  <p className="text-2xl font-bold text-foreground">{positions.length}</p>
                </div>
                <BriefcaseIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {positions.length > 0
                      ? Math.round(positions.reduce((acc, p) => acc + p.duration, 0) / positions.length)
                      : 0}
                    m
                  </p>
                </div>
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Questions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {positions.reduce((acc, p) => acc + p.questions.length, 0)}
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">All Positions</h2>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Position
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Position</DialogTitle>
                <DialogDescription>Add a new interview position with questions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position-id">Position ID</Label>
                    <Input
                      id="position-id"
                      value={newPositionData.id}
                      onChange={(e) => setNewPositionData((prev) => ({ ...prev, id: e.target.value }))}
                      placeholder="e.g., react-dev"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position-title">Title</Label>
                    <Input
                      id="position-title"
                      value={newPositionData.title}
                      onChange={(e) => setNewPositionData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., React.js Developer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position-description">Description</Label>
                  <Textarea
                    id="position-description"
                    value={newPositionData.description}
                    onChange={(e) => setNewPositionData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the position and requirements..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position-level">Level</Label>
                    <Select
                      value={newPositionData.level}
                      onValueChange={(value) => setNewPositionData((prev) => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position-duration">Duration (minutes)</Label>
                    <Input
                      id="position-duration"
                      type="number"
                      value={newPositionData.duration}
                      onChange={(e) =>
                        setNewPositionData((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) }))
                      }
                      min="15"
                      max="120"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => addQuestion()}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                  {newPositionData.questions.map((q, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Question {index + 1}</span>
                        {newPositionData.questions.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(index)}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestion(index, "question", e.target.value)}
                        placeholder="Enter the main question..."
                      />
                      <Input
                        value={q.followUp}
                        onChange={(e) => updateQuestion(index, "followUp", e.target.value)}
                        placeholder="Enter follow-up question..."
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePosition}
                    disabled={!newPositionData.id || !newPositionData.title || !newPositionData.description}
                  >
                    Create Position
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <TableRow key={position._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{position.title}</p>
                        <p className="text-sm text-muted-foreground">{position.description.substring(0, 60)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getLevelBadgeVariant(position.level)}>{position.level}</Badge>
                    </TableCell>
                    <TableCell>{position.duration}m</TableCell>
                    <TableCell>{position.questions.length}</TableCell>
                    <TableCell>{formatDate(position.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setEditingPosition(position)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePosition(position.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
              <DialogDescription>Update position details and questions</DialogDescription>
            </DialogHeader>
            {editingPosition && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingPosition.title}
                    onChange={(e) => setEditingPosition({ ...editingPosition, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingPosition.description}
                    onChange={(e) => setEditingPosition({ ...editingPosition, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-level">Level</Label>
                    <Select
                      value={editingPosition.level}
                      onValueChange={(value) => setEditingPosition({ ...editingPosition, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-duration">Duration (minutes)</Label>
                    <Input
                      id="edit-duration"
                      type="number"
                      value={editingPosition.duration}
                      onChange={(e) =>
                        setEditingPosition({ ...editingPosition, duration: Number.parseInt(e.target.value) })
                      }
                      min="15"
                      max="120"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Questions</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => addQuestion(true)}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </div>
                  {editingPosition.questions.map((q, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Question {index + 1}</span>
                        {editingPosition.questions.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(index, true)}>
                            <XIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        value={q.question}
                        onChange={(e) => updateQuestion(index, "question", e.target.value, true)}
                        placeholder="Enter the main question..."
                      />
                      <Input
                        value={q.followUp}
                        onChange={(e) => updateQuestion(index, "followUp", e.target.value, true)}
                        placeholder="Enter follow-up question..."
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditPosition}>Update Position</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
