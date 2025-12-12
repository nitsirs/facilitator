import type { Block, Participant, Workshop, Session } from "./types"

export const initialBlocks: Block[] = [
  {
    id: "1",
    type: "discussion",
    title: "Check-in",
    duration: 5,
    prompt: "What's one word that describes how you're feeling today, and why?",
    groupingMethod: "random",
    hasReflection: true,
  },
  {
    id: "2",
    type: "survey",
    title: "Team Dynamics",
    duration: 10,
    subscales: [
      {
        id: "s1",
        title: "Psychological Safety",
        questions: [
          {
            id: "q1",
            type: "markdown",
            text: "**Instructions:** Please rate your agreement with the following statements about your team.",
          },
          {
            id: "q2",
            type: "likert",
            text: "I feel safe to take risks on this team",
            scale: {
              min: 1,
              max: 5,
              labels: { min: "Strongly Disagree", max: "Strongly Agree" },
            },
          },
          {
            id: "q3",
            type: "likert",
            text: "Team members value and respect my contributions",
            scale: {
              min: 1,
              max: 5,
              labels: { min: "Strongly Disagree", max: "Strongly Agree" },
            },
          },
          {
            id: "q4",
            type: "multiple-choice",
            text: "How often do you feel heard in team meetings?",
            options: ["Always", "Often", "Sometimes", "Rarely", "Never"],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    type: "discussion",
    title: "Closing Reflection",
    duration: 5,
    prompt: "What is one insight you're taking away from today's session?",
    groupingMethod: "table-based",
    hasReflection: true,
  },
]

export const mockParticipants: Participant[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`,
  name: `Participant ${i + 1}`,
  avatar: `/placeholder.svg?height=40&width=40&query=avatar${i + 1}`,
  status: ["thinking", "finished", "help-needed"][Math.floor(Math.random() * 3)] as Participant["status"],
}))

export const mockWorkshops: Workshop[] = [
  {
    id: "w1",
    title: "Psychological Safety Activity",
    date: "2024-12-15",
    duration: 480, // 8 hours in minutes
    description: "Building trust and psychological safety in teams",
    blocks: initialBlocks,
    status: "upcoming",
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-10T14:30:00Z",
  },
  {
    id: "w2",
    title: "Team Communication Workshop",
    date: "2024-12-20",
    duration: 360,
    description: "Improving team communication and collaboration",
    blocks: [
      {
        id: "1",
        type: "discussion",
        title: "Communication Styles",
        duration: 15,
        prompt: "Share your preferred communication style and how it impacts your work",
        groupingMethod: "random",
        hasReflection: true,
      },
    ],
    status: "upcoming",
    createdAt: "2024-11-28T09:00:00Z",
    updatedAt: "2024-12-08T11:00:00Z",
  },
  {
    id: "w3",
    title: "Untitled Workshop",
    blocks: [],
    status: "draft",
    createdAt: "2024-12-12T08:00:00Z",
    updatedAt: "2024-12-12T08:00:00Z",
  },
]

export const mockSessions: Session[] = [
  {
    id: "s1",
    workshopId: "w1",
    title: "Psychological Safety Activity - Session 1",
    startedAt: "2024-12-12T09:00:00Z",
    status: "active",
    currentBlockId: "1",
    participants: mockParticipants,
    elapsedTime: 300, // 5 minutes
  },
]
