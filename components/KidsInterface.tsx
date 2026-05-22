'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TreePine, BookOpen, Cpu, Camera, ChevronDown } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import ChatBot from '@/components/ChatBot'
import AssignmentHelper from '@/components/AssignmentHelper'
import GamesSection from '@/components/GamesSection'
import AvatarPicker from '@/components/AvatarPicker'

const forestAnimals = [
  { id: 'owl',    name: 'Wise Owl',       emoji: '🦉', color: 'from-amber-400 to-orange-500',  description: 'Patient & wise' },
  { id: 'monkey', name: 'Playful Monkey', emoji: '🐵', color: 'from-yellow-400 to-orange-500', description: 'Fun & energetic' },
  { id: 'rabbit', name: 'Quick Rabbit',   emoji: '🐰', color: 'from-pink-300 to-rose-400',     description: 'Fast learner' },
  { id: 'fox',    name: 'Clever Fox',     emoji: '🦊', color: 'from-orange-400 to-red-500',    description: 'Sharp & curious' },
  { id: 'deer',   name: 'Gentle Deer',    emoji: '🦌', color: 'from-amber-300 to-yellow-500',  description: 'Kind & calm' },
  { id: 'bear',   name: 'Friendly Bear',  emoji: '🐻', color: 'from-yellow-600 to-amber-700',  description: 'Strong & caring' },
]

const TABS = [
  { id: 'chat',        label: 'Chat',         icon: BookOpen, emoji: '💬', color: 'from-green-500 to-emerald-500' },
  { id: 'assignments', label: 'Homework',     icon: Camera,   emoji: '📚', color: 'from-blue-500 to-cyan-500' },
  { id: 'games',       label: 'Games',        icon: Cpu,      emoji: '🎮', color: 'from-purple-500 to-pink-500' },
]

// Floating bg elements
const BG = ['🌿','🍃','🌳','🌸','🦋','🐝','🍀','🌺']

export default function KidsInterface({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'assignments' | 'games'>('chat')
  const [pickerOpen, setPickerOpen] = useState(false)
  const { selectedAvatar, setSelectedAvatar } = useAppStore()

  const currentAvatar = forestAnimals.find(a => a.id === selectedAvatar) || forestAnimals[0]
  if (!forestAnimals.find(a => a.id === selectedAvatar)) setSelectedAvatar(forestAnimals[0].id)

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-950 via-emerald-900 to-teal-950" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(34,197,94,0.4) 0%, transparent 50%),
                          radial-gradient(circle at 80% 70%, rgba(16,185,129,0.3) 0%, transparent 50%)`,
      }} />

      {/* Floating bg emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {BG.map((e, i) => (
          <motion.span key={i}
            className="absolute text-4xl sm:text-5xl select-none"
            style={{ left: `${8 + i * 11}%`, top: `${10 + (i * 13) % 75}%`, opacity: 0.12 }}
            animate={{ y: [0, -20, 0], rotate: [0, i % 2 === 0 ? 8 : -8, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          >{e}</motion.span>
        ))}
      </div>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">

          {/* Back */}
          <motion.button whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }} onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 sm:px-4 py-2 rounded-xl border border-white/10 transition-all text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </motion.button>

          {/* Title */}
          <div className="flex items-center gap-3 flex-1 justify-center">
            <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <TreePine className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 drop-shadow" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-base sm:text-xl font-black text-white leading-none">Forest Learning Academy</h1>
              <p className="text-emerald-300/80 text-xs sm:text-sm font-medium">Adventure awaits! 🌟</p>
            </div>
          </div>

          {/* Avatar trigger button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPickerOpen(true)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl px-3 py-2 transition-all group"
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${currentAvatar.color} flex items-center justify-center text-xl sm:text-2xl shadow-lg border-2 border-white/30`}
            >
              {currentAvatar.emoji}
            </motion.div>
            <div className="hidden sm:block text-left">
              <p className="text-white text-xs font-bold leading-none">{currentAvatar.name}</p>
              <p className="text-white/50 text-xs mt-0.5">Change</p>
            </div>
            <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white/70 transition-colors" />
          </motion.button>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-none">
          {TABS.map(tab => (
            <motion.button key={tab.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'text-white bg-white/20 border border-white/30 shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <span className="text-base sm:text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="kids-tab-indicator"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} opacity-20`}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
              )}
            </motion.button>
          ))}
        </div>
      </motion.header>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div key="chat"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              <div className="lg:col-span-2">
                <ChatBot theme="forest" avatar={currentAvatar} ageGroup="kids" />
              </div>

              {/* Companion card — hidden on mobile, visible on lg+ */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl flex-col items-center text-center">
                <motion.button
                  onClick={() => setPickerOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative mb-4"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className={`w-28 h-28 rounded-full bg-gradient-to-br ${currentAvatar.color} flex items-center justify-center text-5xl shadow-2xl border-4 border-white/20 group-hover:border-white/50 transition-all`}
                  >
                    {currentAvatar.emoji}
                  </motion.div>
                  <div className="absolute -bottom-1 -right-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2 py-0.5 text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Change
                  </div>
                </motion.button>

                <h3 className="text-xl font-black text-white mb-1">{currentAvatar.name}</h3>
                <p className="text-white/50 text-sm mb-5">{currentAvatar.description}</p>

                <div className="w-full space-y-2 text-sm">
                  {[
                    { label: 'Level', value: 'Beginner', color: 'text-emerald-300' },
                    { label: 'Focus', value: 'Math & Science', color: 'text-emerald-300' },
                    { label: 'Fun', value: '⭐⭐⭐⭐⭐', color: 'text-yellow-300' },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                      <span className="text-white/60">{row.label}</span>
                      <span className={`font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div key="assignments"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}>
              <AssignmentHelper theme="forest" ageGroup="kids" avatarId={currentAvatar.id} />
            </motion.div>
          )}

          {activeTab === 'games' && (
            <motion.div key="games"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}>
              <GamesSection theme="forest" ageGroup="kids" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar picker modal */}
      <AvatarPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        avatars={forestAnimals}
        selectedId={currentAvatar.id}
        onSelect={setSelectedAvatar}
        theme="forest"
      />
    </div>
  )
}
