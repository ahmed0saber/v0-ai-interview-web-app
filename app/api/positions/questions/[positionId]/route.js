import { getCollection } from "../../../../../lib/database.js"
import { generateInterviewQuestion } from "../../../../../lib/gemini.js"

export async function GET(request, { params }) {
  try {
    const { positionId } = params
    const url = new URL(request.url)
    const excludeQuestions = url.searchParams.get("exclude")?.split(",") || []

    const positionsCollection = await getCollection("positions")
    const position = await positionsCollection.findOne({ id: positionId })

    if (!position) {
      return Response.json({ error: "Position not found" }, { status: 404 })
    }

    // Get available questions that haven't been asked
    const availableQuestions = position.questions.filter((q) => !excludeQuestions.includes(q.id))

    if (availableQuestions.length === 0) {
      // Generate new question using Gemini if all predefined questions are used
      try {
        const newQuestion = await generateInterviewQuestion(position.title, excludeQuestions)

        return Response.json({
          question: {
            id: `generated-${Date.now()}`,
            question: newQuestion,
            followUp: "Can you elaborate on that approach?",
          },
        })
      } catch (error) {
        return Response.json({ error: "No more questions available" }, { status: 404 })
      }
    }

    // Return random question from available ones
    const randomIndex = Math.floor(Math.random() * availableQuestions.length)
    const selectedQuestion = availableQuestions[randomIndex]

    return Response.json({ question: selectedQuestion })
  } catch (error) {
    return Response.json({ error: "Failed to get question" }, { status: 500 })
  }
}
