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

export interface GameBadge {
  id: string           // e.g. "kids-bubble-1"
  gameId: string       // e.g. "bubble"
  gameTitle: string
  emoji: string
  score: number
  earnedAt: string
  ageGroup: 'kids' | 'teens'
}

interface AppState {
  currentUser: User | null
  setCurrentUser: (user: User) => void

  messagesByAvatar: Record<string, ChatMessage[]>
  addMessage: (avatarId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: (avatarId: string) => void
  getMessages: (avatarId: string) => ChatMessage[]

  assignments: Assignment[]
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void
  updateAssignment: (id: string, updates: Partial<Assignment>) => void

  progress: Progress[]
  updateProgress: (userId: string, updates: Partial<Progress>) => void

  // Badges earned from games
  badges: GameBadge[]
  addBadge: (badge: Omit<GameBadge, 'id' | 'earnedAt'>) => void

  isChatOpen: boolean
  setIsChatOpen: (open: boolean) => void

  selectedAvatar: string
  setSelectedAvatar: (avatar: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),

      messagesByAvatar: {},
      getMessages: (avatarId) => get().messagesByAvatar[avatarId] ?? [],
      addMessage: (avatarId, message) => set((state) => {
        const existing = state.messagesByAvatar[avatarId] ?? []
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

      progress: [],
      updateProgress: (userId, updates) => set((state) => ({
        progress: state.progress.map(p => p.userId === userId ? { ...p, ...updates } : p),
      })),

      badges: [],
      addBadge: (badge) => set((state) => ({
        badges: [
          ...state.badges,
          { ...badge, id: `${badge.gameId}-${Date.now()}`, earnedAt: new Date().toISOString() },
        ],
      })),

      isChatOpen: false,
      setIsChatOpen: (open) => set({ isChatOpen: open }),

      selectedAvatar: 'owl',
      setSelectedAvatar: (avatar) => set({ selectedAvatar: avatar }),
    }),
    {
      name: 'buddy-app-store',
      partialize: (state) => ({
        messagesByAvatar: state.messagesByAvatar,
        assignments: state.assignments,
        selectedAvatar: state.selectedAvatar,
        currentUser: state.currentUser,
        badges: state.badges,
      }),
    }
  )
)

