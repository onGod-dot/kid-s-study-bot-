import { create } from 'zustand'

export interface User {
  id: string
  name: string
  age: number
  ageGroup: 'kids' | 'teens'
  avatar: string
  theme: 'forest' | 'space'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  audioUrl?: string
  imageUrl?: string
}

export interface Assignment {
  id: string
  title: string
  subject: string
  description: string
  imageUrl?: string
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: Date
}

export interface Progress {
  userId: string
  assignmentsCompleted: number
  timeSpent: number
  skillsLearned: string[]
  lastActivity: Date
}

interface AppState {
  // User state
  currentUser: User | null
  setCurrentUser: (user: User) => void

  // Per-avatar chat state
  messagesByAvatar: Record<string, ChatMessage[]>
  addMessage: (avatarId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: (avatarId: string) => void
  getMessages: (avatarId: string) => ChatMessage[]

  // Assignment state
  assignments: Assignment[]
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void
  updateAssignment: (id: string, updates: Partial<Assignment>) => void

  // Progress tracking
  progress: Progress[]
  updateProgress: (userId: string, updates: Partial<Progress>) => void

  // UI state
  isChatOpen: boolean
  setIsChatOpen: (open: boolean) => void

  selectedAvatar: string
  setSelectedAvatar: (avatar: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // User state
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // Per-avatar chat state
  messagesByAvatar: {},
  getMessages: (avatarId) => get().messagesByAvatar[avatarId] ?? [],
  addMessage: (avatarId, message) => set((state) => {
    const existing = state.messagesByAvatar[avatarId] ?? []
    return {
      messagesByAvatar: {
        ...state.messagesByAvatar,
        [avatarId]: [
          ...existing,
          { ...message, id: Date.now().toString(), timestamp: new Date() }
        ]
      }
    }
  }),
  clearMessages: (avatarId) => set((state) => ({
    messagesByAvatar: { ...state.messagesByAvatar, [avatarId]: [] }
  })),

  // Assignment state
  assignments: [],
  addAssignment: (assignment) => set((state) => ({
    assignments: [...state.assignments, {
      ...assignment,
      id: Date.now().toString(),
      createdAt: new Date()
    }]
  })),
  updateAssignment: (id, updates) => set((state) => ({
    assignments: state.assignments.map(a =>
      a.id === id ? { ...a, ...updates } : a
    )
  })),

  // Progress tracking
  progress: [],
  updateProgress: (userId, updates) => set((state) => ({
    progress: state.progress.map(p =>
      p.userId === userId ? { ...p, ...updates } : p
    )
  })),

  // UI state
  isChatOpen: false,
  setIsChatOpen: (open) => set({ isChatOpen: open }),

  selectedAvatar: 'owl',
  setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
}))
