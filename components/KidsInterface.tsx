'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TreePine, BookOpen, Code, Cpu, Camera, Mic, MicOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import ChatBot from '@/components/ChatBot'
import AssignmentHelper from '@/components/AssignmentHelper'
import SteamSection from '@/components/SteamSection'

const forestAnimals = [
  { id: 'owl', name: 'Wise Owl', emoji: '🦉', color: 'from-amber-400 to-orange-500' },
  { id: 'monkey', name: 'Playful Monkey', emoji: '🐵', color: 'from-yellow-400 to-orange-500' },
  { id: 'rabbit', name: 'Quick Rabbit', emoji: '🐰', color: 'from-gray-300 to-gray-500' },
  { id: 'fox', name: 'Clever Fox', emoji: '🦊', color: 'from-orange-400 to-red-500' },
  { id: 'deer', name: 'Gentle Deer', emoji: '🦌', color: 'from-amber-300 to-brown-500' },
  { id: 'bear', name: 'Friendly Bear', emoji: '🐻', color: 'from-yellow-600 to-brown-600' }
]

export default function KidsInterface({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'assignments' | 'stem'>('chat')
  const [isListening, setIsListening] = useState(false)
  const { selectedAvatar, setSelectedAvatar } = useAppStore()

  // Set default avatar if none selected or if selected avatar is not in forest animals
  const currentAvatar = forestAnimals.find(animal => animal.id === selectedAvatar) || forestAnimals[0]
  
  // Update store if needed
  if (!forestAnimals.find(animal => animal.id === selectedAvatar)) {
    setSelectedAvatar(forestAnimals[0].id)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Background with Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 via-transparent to-green-700/30"></div>
      
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.1) 0%, transparent 50%)`,
          backgroundSize: '400px 400px, 600px 600px, 800px 800px'
        }}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-10 text-8xl opacity-25"
        >
          🌿
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -8, 0],
            x: [0, 15, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute top-32 right-16 text-7xl opacity-20"
        >
          🍃
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, 20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-40 left-20 text-6xl opacity-25"
        >
          🌳
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 18, 0],
            rotate: [0, 6, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute bottom-20 right-10 text-6xl opacity-20"
        >
          🌸
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -12, 0],
            x: [0, -10, 0]
          }}
          transition={{ 
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute top-1/2 left-1/3 text-5xl opacity-15"
        >
          🦋
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 14, 0],
            rotate: [0, -4, 0]
          }}
          transition={{ 
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-1/3 right-1/4 text-4xl opacity-20"
        >
          🐝
        </motion.div>
      </div>

      {/* Professional Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-green-600/40 via-emerald-600/40 to-teal-600/40 backdrop-blur-xl border-b-2 border-white/40 p-4 sm:p-6 lg:p-8 shadow-2xl"
      >
        {/* Header Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-emerald-500/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, rgba(34, 197, 94, 0.1) 25%, transparent 25%),
                           linear-gradient(-45deg, rgba(16, 185, 129, 0.1) 25%, transparent 25%),
                           linear-gradient(45deg, transparent 75%, rgba(5, 150, 105, 0.1) 75%),
                           linear-gradient(-45deg, transparent 75%, rgba(6, 182, 212, 0.1) 75%)`,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}></div>
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <motion.button
            whileHover={{ scale: 1.08, x: -8 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="flex items-center space-x-2 sm:space-x-3 text-white hover:text-green-200 transition-all duration-300 bg-white/15 hover:bg-white/25 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl backdrop-blur-md border-2 border-white/30 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="font-semibold text-sm sm:text-lg">Back to Home</span>
          </motion.button>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
              <TreePine className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white drop-shadow-2xl" />
            </motion.div>
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-2xl mb-1 sm:mb-2"
              >
                🌲 Forest Learning Academy
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-green-100 text-sm sm:text-base lg:text-lg font-medium"
              >
                Adventure awaits in the magical forest! 🌟
              </motion.p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 sm:space-y-4">
            <span className="text-white/95 font-bold text-sm sm:text-base lg:text-lg">Choose your companion:</span>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {forestAnimals.map((animal) => (
                <motion.button
                  key={animal.id}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSelectedAvatar(animal.id)}
                  className={`p-2 sm:p-3 lg:p-4 rounded-2xl transition-all duration-300 ${
                    selectedAvatar === animal.id
                      ? 'bg-white/40 scale-110 shadow-2xl border-3 border-white/60 backdrop-blur-md'
                      : 'bg-white/15 hover:bg-white/25 border-2 border-white/30 backdrop-blur-sm hover:shadow-lg'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl lg:text-4xl drop-shadow-2xl">{animal.emoji}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Content Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800/20 via-emerald-800/10 to-teal-800/20 rounded-3xl blur-3xl"></div>
        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-6 sm:mb-10"
        >
          {[
            { id: 'chat', label: 'Chat with Buddy', icon: BookOpen, emoji: '💬', color: 'from-green-500 to-emerald-500' },
            { id: 'assignments', label: 'Homework Help', icon: Camera, emoji: '📚', color: 'from-blue-500 to-cyan-500' },
            { id: 'stem', label: 'STEM Learning', icon: Cpu, emoji: '🔬', color: 'from-purple-500 to-pink-500' }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4 px-4 sm:px-6 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-3xl transition-all duration-300 ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.color}/40 text-white shadow-2xl border-3 border-white/40 backdrop-blur-md`
                  : 'bg-white/15 text-white/90 hover:bg-white/25 border-2 border-white/30 backdrop-blur-sm hover:shadow-xl'
              }`}
            >
              <span className="text-2xl sm:text-3xl drop-shadow-lg">{tab.emoji}</span>
              <tab.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              <span className="font-bold text-sm sm:text-base lg:text-xl">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Chat Interface */}
                <div className="lg:col-span-2">
                  <ChatBot 
                    theme="forest" 
                    avatar={currentAvatar}
                    ageGroup="kids"
                  />
                </div>
                
                {/* Companion Info */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl"
                >
                  <div className="text-center">
                    <motion.div 
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${currentAvatar.color} flex items-center justify-center text-6xl shadow-2xl border-4 border-white/30`}
                    >
                      {currentAvatar.emoji}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
                      {currentAvatar.name}
                    </h3>
                    <p className="text-white/90 text-base mb-6 leading-relaxed">
                      Your friendly learning companion! Click on me to chat and learn together. 🌟
                    </p>
                    
                    <div className="space-y-3 text-sm">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20"
                      >
                        <span className="text-white/80">Learning Level:</span>
                        <span className="text-green-300 font-semibold">Beginner</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20"
                      >
                        <span className="text-white/80">Specialty:</span>
                        <span className="text-green-300 font-semibold">Math & Science</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20"
                      >
                        <span className="text-white/80">Fun Factor:</span>
                        <span className="text-yellow-300 font-semibold text-lg">⭐⭐⭐⭐⭐</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AssignmentHelper theme="forest" ageGroup="kids" />
            </motion.div>
          )}

          {activeTab === 'stem' && (
            <motion.div
              key="stem"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SteamSection theme="forest" ageGroup="kids" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
