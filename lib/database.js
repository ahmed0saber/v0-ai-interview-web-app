import clientPromise from "./mongodb.js"

export async function getDatabase() {
  const client = await clientPromise
  return client.db("ai_interview_platform")
}

export async function getCollection(collectionName) {
  const db = await getDatabase()
  return db.collection(collectionName)
}

// Database initialization
export async function initializeDatabase() {
  const db = await getDatabase()

  // Create indexes for better performance
  await db.collection("coupons").createIndex({ code: 1 }, { unique: true })
  await db.collection("users").createIndex({ email: 1 }, { unique: true })
  await db.collection("interview_records").createIndex({ userId: 1, createdAt: -1 })
}

// Seed initial data
export async function seedDatabase() {
  const db = await getDatabase()

  // Seed positions
  const positions = await db.collection("positions").countDocuments()
  if (positions === 0) {
    await db.collection("positions").insertMany([
      {
        id: "react-developer",
        title: "React.js Developer",
        description: "Frontend development with React.js, hooks, and modern JavaScript",
        duration: 45,
        questionCount: 8,
        skills: ["React", "JavaScript", "HTML/CSS", "State Management"],
        questions: [
          "What are React hooks and how do they work?",
          "Explain the difference between state and props in React.",
          "How would you optimize a React application for performance?",
          "What is the virtual DOM and how does it work?",
          "Explain the useEffect hook and its dependencies.",
          "How do you handle forms in React?",
          "What are higher-order components (HOCs)?",
          "Explain React context and when to use it.",
        ],
      },
      {
        id: "nodejs-developer",
        title: "Node.js Developer",
        description: "Backend development with Node.js, Express, and databases",
        duration: 50,
        questionCount: 8,
        skills: ["Node.js", "Express", "Databases", "APIs"],
        questions: [
          "What is the event loop in Node.js?",
          "How do you handle asynchronous operations in Node.js?",
          "Explain middleware in Express.js.",
          "What are the differences between SQL and NoSQL databases?",
          "How do you implement authentication in a Node.js application?",
          "What is clustering in Node.js and when would you use it?",
          "How do you handle errors in Node.js applications?",
          "Explain the concept of streams in Node.js.",
        ],
      },
      {
        id: "fullstack-developer",
        title: "Full Stack Developer",
        description: "Complete web development with frontend and backend technologies",
        duration: 60,
        questionCount: 10,
        skills: ["React", "Node.js", "Databases", "System Design"],
        questions: [
          "How would you design a scalable web application architecture?",
          "Explain the differences between REST and GraphQL APIs.",
          "How do you ensure security in a full-stack application?",
          "What is server-side rendering and when would you use it?",
          "How do you handle state management in large applications?",
          "Explain database normalization and denormalization.",
          "How would you implement real-time features in a web app?",
          "What are microservices and their advantages?",
          "How do you optimize database queries?",
          "Explain CI/CD and deployment strategies.",
        ],
      },
    ])
  }

  // Seed sample coupons
  const coupons = await db.collection("coupons").countDocuments()
  if (coupons === 0) {
    await db.collection("coupons").insertMany([
      {
        code: "INTERVIEW2024",
        isUsed: false,
        usedBy: null,
        expiresAt: new Date("2024-12-31"),
        createdAt: new Date(),
        createdBy: "admin",
      },
      {
        code: "EARLY_BIRD",
        isUsed: false,
        usedBy: null,
        expiresAt: new Date("2024-06-30"),
        createdAt: new Date(),
        createdBy: "admin",
      },
      {
        code: "PREMIUM_TEST",
        isUsed: false,
        usedBy: null,
        expiresAt: new Date("2024-12-31"),
        createdAt: new Date(),
        createdBy: "admin",
      },
    ])
  }
}
