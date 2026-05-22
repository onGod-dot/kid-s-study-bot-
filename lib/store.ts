import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  // Store as ISO string for JSON serialisation; convert to Date on read
  timestamp: string
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
  createdAt: string
}

export interface Progress {
  userId: string
  assignmentsCompleted: number
  timeSpent: number
  skillsLearned: string[]
  lastActivity: string
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User state
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      // Per-avatar chat state
      messagesByAvatar: {},
      getMessages: (avatarId) => get().messagesByAvatar[avatarId] ?? [],
      addMessage: (avatarId, message) => set((state) => {
        const existing = state.messagesByAvatar[avatarId] ?? []
        // Cap per-avatar history at 100 messages to avoid unbounded storage
        const capped = existing.length >= 100 ? existing.slice(-99) : existing
        return {
          messagesByAvatar: {
            ...state.messagesByAvatar,
            [avatarId]: [
              ...capped,
              { ...message, id: Date.now().toString(), timestamp: new Date().toISOString() },
            ],
          },
        }
      }),
      clearMessages: (avatarId) => set((state) => ({
        messagesByAvatar: { ...state.messagesByAvatar, [avatarId]: [] },
      })),

      // Assignment state
      assignments: [],
      addAssignment: (assignment) => set((state) => ({
        assignments: [...state.assignments, {
          ...assignment,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }],
      })),
      updateAssignment: (id, updates) => set((state) => ({
        assignments: state.assignments.map(a => a.id === id ? { ...a, ...updates } : a),
      })),

      // Progress tracking
      progress: [],
      updateProgress: (userId, updates) => set((state) => ({
        progress: state.progress.map(p => p.userId === userId ? { ...p, ...updates } : p),
      })),

      // UI state
      isChatOpen: false,
      setIsChatOpen: (open) => set({ isChatOpen: open }),

      selectedAvatar: 'owl',
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
    }),
    {
      name: 'buddy-app-store',
      // Only persist the data that should survive a refresh
      partialize: (state) => ({
        messagesByAvatar: state.messagesByAvatar,
        assignments: state.assignments,
        selectedAvatar: state.selectedAvatar,
        currentUser: state.currentUser,
      }),
    }
  )
)

