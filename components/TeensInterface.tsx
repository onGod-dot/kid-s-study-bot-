'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Rocket, BookOpen, Code, Cpu, Camera, Mic, MicOff } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import ChatBot from '@/components/ChatBot'
import AssignmentHelper from '@/components/AssignmentHelper'
import SteamSection from '@/components/SteamSection'

const spaceBeings = [
  { id: 'star', name: 'Stellar Guide', emoji: '⭐', color: 'from-yellow-300 to-yellow-500' },
  { id: 'astronaut', name: 'Space Explorer', emoji: '👨‍🚀', color: 'from-blue-400 to-blue-600' },
  { id: 'alien', name: 'Cosmic Scholar', emoji: '👽', color: 'from-green-400 to-green-600' },
  { id: 'planet', name: 'Orbital Mentor', emoji: '🪐', color: 'from-purple-400 to-pink-500' },
  { id: 'comet', name: 'Swift Learner', emoji: '☄️', color: 'from-cyan-400 to-blue-500' },
  { id: 'nebula', name: 'Cosmic Wisdom', emoji: '🌌', color: 'from-indigo-400 to-purple-600' }
]

export default function TeensInterface({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'chat' | 'assignments' | 'stem'>('chat')
  const [isListening, setIsListening] = useState(false)
  const { selectedAvatar, setSelectedAvatar } = useAppStore()

  // Set default avatar if none selected or if selected avatar is not in space beings
  const currentAvatar = spaceBeings.find(being => being.id === selectedAvatar) || spaceBeings[0]
  
  // Update store if needed
  if (!spaceBeings.find(being => being.id === selectedAvatar)) {
    setSelectedAvatar(spaceBeings[0].id)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Space Background with Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-blue-900/30"></div>
      
      {/* Professional Space Pattern */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 40% 60%, rgba(29, 78, 216, 0.2) 0%, transparent 50%)`,
          backgroundSize: '500px 500px, 700px 700px, 900px 900px'
        }}></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, 360, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 text-9xl opacity-30"
        >
          🌟
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 25, 0],
            x: [0, 20, 0],
            rotate: [0, -180, 0]
          }}
          transition={{ 
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-32 right-16 text-8xl opacity-25"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            x: [0, -15, 0],
            rotate: [0, 90, 0]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
          className="absolute bottom-40 left-20 text-7xl opacity-20"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            rotate: [0, -270, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-20 right-10 text-7xl opacity-25"
        >
          🌌
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -25, 0],
            x: [0, 25, 0]
          }}
          transition={{ 
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute top-1/2 left-1/4 text-6xl opacity-15"
        >
          🛸
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, 180, 0]
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-1/3 right-1/3 text-5xl opacity-20"
        >
          🌠
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            x: [0, -20, 0]
          }}
          transition={{ 
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6
          }}
          className="absolute bottom-1/3 left-1/2 text-4xl opacity-15"
        >
          🪐
        </motion.div>
      </div>

      {/* Professional Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-indigo-600/40 backdrop-blur-xl border-b-2 border-white/40 p-4 sm:p-6 lg:p-8 shadow-2xl"
      >
        {/* Header Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, rgba(59, 130, 246, 0.1) 25%, transparent 25%),
                           linear-gradient(-45deg, rgba(147, 51, 234, 0.1) 25%, transparent 25%),
                           linear-gradient(45deg, transparent 75%, rgba(29, 78, 216, 0.1) 75%),
                           linear-gradient(-45deg, transparent 75%, rgba(99, 102, 241, 0.1) 75%)`,
          backgroundSize: '25px 25px',
          backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
        }}></div>
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <motion.button
            whileHover={{ scale: 1.08, x: -8 }}
            whileTap={{ scale: 0.92 }}
            onClick={onBack}
            className="flex items-center space-x-2 sm:space-x-3 text-white hover:text-blue-200 transition-all duration-300 bg-white/15 hover:bg-white/25 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl backdrop-blur-md border-2 border-white/30 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="font-semibold text-sm sm:text-lg">Back to Home</span>
          </motion.button>
          
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            <motion.div
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
              <Rocket className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white drop-shadow-2xl" />
            </motion.div>
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-2xl mb-1 sm:mb-2"
              >
                🚀 Space Academy
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-blue-100 text-sm sm:text-base lg:text-lg font-medium"
              >
                Explore the cosmos of knowledge! 🌌
              </motion.p>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-2 sm:space-y-4">
            <span className="text-white/95 font-bold text-sm sm:text-base lg:text-lg">Choose your mentor:</span>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {spaceBeings.map((being) => (
                <motion.button
                  key={being.id}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSelectedAvatar(being.id)}
                  className={`p-2 sm:p-3 lg:p-4 rounded-2xl transition-all duration-300 ${
                    selectedAvatar === being.id
                      ? 'bg-white/40 scale-110 shadow-2xl border-3 border-white/60 backdrop-blur-md'
                      : 'bg-white/15 hover:bg-white/25 border-2 border-white/30 backdrop-blur-sm hover:shadow-lg'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl lg:text-4xl drop-shadow-2xl">{being.emoji}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Content Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 via-purple-800/10 to-indigo-800/20 rounded-3xl blur-3xl"></div>
        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-6 sm:mb-10"
        >
          {[
            { id: 'chat', label: 'Chat with Mentor', icon: BookOpen, emoji: '💬', color: 'from-blue-500 to-cyan-500' },
            { id: 'assignments', label: 'Assignment Help', icon: Camera, emoji: '📚', color: 'from-purple-500 to-pink-500' },
            { id: 'stem', label: 'STEM Projects', icon: Cpu, emoji: '🔬', color: 'from-indigo-500 to-violet-500' }
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
                    theme="space" 
                    avatar={currentAvatar}
                    ageGroup="teens"
                  />
                </div>
                
                {/* Mentor Info */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/30 shadow-2xl"
                >
                  <div className="text-center">
                    <motion.div 
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 5,
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
                      Your cosmic learning mentor! Ready to explore advanced concepts together. 🚀
                    </p>
                    
                    <div className="space-y-3 text-sm">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20"
                      >
                        <span className="text-white/80">Learning Level:</span>
                        <span className="text-blue-300 font-semibold">Advanced</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20"
                      >
                        <span className="text-white/80">Specialty:</span>
                        <span className="text-blue-300 font-semibold">STEM & Coding</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center justify-between bg-white/10 rounded-xl p-3 border border-white/20"
                      >
                        <span className="text-white/80">Challenge Level:</span>
                        <span className="text-purple-300 font-semibold text-lg">⭐⭐⭐⭐⭐</span>
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
              <AssignmentHelper theme="space" ageGroup="teens" />
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
              <SteamSection theme="space" ageGroup="teens" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
