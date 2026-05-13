'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TreePine, Rocket, Users, BookOpen, Sparkles, Zap, Brain, Target, Award } from 'lucide-react'
import KidsInterface from '@/components/KidsInterface'
import TeensInterface from '@/components/TeensInterface'
import ParentDashboard from '@/components/ParentDashboard'
import { useSoundEffects } from '@/hooks/useSoundEffects'

export default function Home() {
  const [selectedView, setSelectedView] = useState<'age-select' | 'kids' | 'teens' | 'parent'>('age-select')
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  const { playClickSound, playSuccessSound } = useSoundEffects(soundEnabled)

  const handleAgeGroupSelect = (ageGroup: 'kids' | 'teens') => {
    playClickSound()
    setSelectedView(ageGroup)
  }

  const handleBackToSelection = () => {
    setSelectedView('age-select')
  }

  const handleCardClick = (onClick: () => void) => {
    playSuccessSound()
    onClick()
  }

  if (selectedView === 'kids') {
    return <KidsInterface onBack={handleBackToSelection} />
  }

  if (selectedView === 'teens') {
    return <TeensInterface onBack={handleBackToSelection} />
  }

  if (selectedView === 'parent') {
    return <ParentDashboard onBack={handleBackToSelection} />
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
          backgroundSize: '400px 400px, 600px 600px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl w-full">
          {/* Professional Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
              Buddy
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-2 font-medium">
              AI Study Companion
            </p>
            <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8">
              Intelligent learning support for students of all ages
            </p>
            
            {/* Professional Features */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {[
                { icon: Brain, label: "AI Powered" },
                { icon: Target, label: "Personalized" },
                { icon: Award, label: "STEM Focus" }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center space-x-2 bg-white rounded-lg px-3 sm:px-4 py-2 shadow-sm border border-gray-200"
                >
                  <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Professional Age Group Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            {[
              {
                id: 'kids',
                title: 'Kids (5-12)',
                description: 'Interactive learning with age-appropriate content',
                icon: TreePine,
                color: 'green',
                onClick: () => handleAgeGroupSelect('kids')
              },
              {
                id: 'teens',
                title: 'Teens (13-18)',
                description: 'Advanced STEM learning and career preparation',
                icon: Rocket,
                color: 'blue',
                onClick: () => handleAgeGroupSelect('teens')
              },
              {
                id: 'parent',
                title: 'Parents',
                description: 'Monitor progress and track learning outcomes',
                icon: Users,
                color: 'purple',
                onClick: () => setSelectedView('parent')
              }
            ].map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
                onClick={() => handleCardClick(card.onClick)}
              >
                <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 lg:p-8 border-l-4 border-${card.color}-500`}>
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className={`p-2 sm:p-3 rounded-lg bg-${card.color}-100 mr-3 sm:mr-4`}>
                      <card.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${card.color}-600`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    {card.description}
                  </p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    <span className="text-sm sm:text-base">Get Started</span>
                    <motion.div
                      className="ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Professional Features Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 bg-white rounded-lg px-4 sm:px-6 lg:px-8 py-4 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">STEM Learning</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">Homework Help</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span className="text-sm sm:text-base text-gray-700 font-medium">Interactive AI</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}