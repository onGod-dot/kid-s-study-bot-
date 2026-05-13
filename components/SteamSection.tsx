'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Code, Palette, Calculator, Microscope, Gamepad2, Play, Pause, RotateCcw, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'

interface SteamSectionProps {
  theme: 'forest' | 'space'
  ageGroup: 'kids' | 'teens'
}

const steamActivities = {
  kids: [
    {
      id: 'scratch-coding',
      title: 'Scratch Coding Adventure',
      description: 'Learn programming basics with colorful blocks',
      icon: Code,
      color: 'from-orange-400 to-red-500',
      difficulty: 'Beginner',
      duration: '15-30 min',
      embedUrl: 'https://scratch.mit.edu/projects/editor/?tutorial=getStarted',
      embedType: 'scratch'
    },
    {
      id: 'codepen-html',
      title: 'Web Design Playground',
      description: 'Create colorful websites with HTML & CSS',
      icon: Palette,
      color: 'from-pink-400 to-purple-500',
      difficulty: 'Beginner',
      duration: '20-30 min',
      embedUrl: 'https://codepen.io/pen/',
      embedType: 'codepen'
    },
    {
      id: 'math-games',
      title: 'Interactive Math Games',
      description: 'Fun math games and puzzles',
      icon: Calculator,
      color: 'from-green-400 to-blue-500',
      difficulty: 'Beginner',
      duration: '15-25 min',
      embedUrl: 'https://www.mathplayground.com/',
      embedType: 'math'
    },
    {
      id: 'science-simulations',
      title: 'Science Lab',
      description: 'Interactive science experiments',
      icon: Microscope,
      color: 'from-cyan-400 to-blue-500',
      difficulty: 'Beginner',
      duration: '20-30 min',
      embedUrl: 'https://phet.colorado.edu/',
      embedType: 'phet'
    }
  ],
  teens: [
    {
      id: 'python-repl',
      title: 'Python Programming',
      description: 'Learn real programming with Python',
      icon: Code,
      color: 'from-yellow-400 to-orange-500',
      difficulty: 'Intermediate',
      duration: '45-60 min',
      embedUrl: 'https://replit.com/@replit/Python-3',
      embedType: 'replit'
    },
    {
      id: 'codepen-advanced',
      title: 'Advanced Web Development',
      description: 'Build complex web applications',
      icon: Cpu,
      color: 'from-purple-400 to-pink-500',
      difficulty: 'Advanced',
      duration: '60-90 min',
      embedUrl: 'https://codepen.io/pen/',
      embedType: 'codepen'
    },
    {
      id: 'jupyter-notebook',
      title: 'Data Science Lab',
      description: 'Explore data and create visualizations',
      icon: Microscope,
      color: 'from-cyan-400 to-blue-500',
      difficulty: 'Intermediate',
      duration: '45-60 min',
      embedUrl: 'https://jupyter.org/try',
      embedType: 'jupyter'
    },
    {
      id: 'unity-playground',
      title: 'Game Development',
      description: 'Create your own video games',
      icon: Gamepad2,
      color: 'from-red-400 to-pink-500',
      difficulty: 'Advanced',
      duration: '60-120 min',
      embedUrl: 'https://unity.com/learn',
      embedType: 'unity'
    }
  ]
}

export default function SteamSection({ theme, ageGroup }: SteamSectionProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const activities = steamActivities[ageGroup]

  const getThemeClasses = () => {
    if (theme === 'forest') {
      return {
        container: 'bg-green-500/10 border-green-500/20',
        button: 'bg-green-500 hover:bg-green-600 text-white',
        card: 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
      }
    } else {
      return {
        container: 'bg-blue-500/10 border-blue-500/20',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        card: 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
      }
    }
  }

  const themeClasses = getThemeClasses()

  const startActivity = (activityId: string) => {
    setSelectedActivity(activityId)
    setIsLoading(true)
    // Simulate loading time for embedded content
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const resetActivity = () => {
    setSelectedActivity(null)
    setIsFullscreen(false)
    setIsLoading(false)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">
          {ageGroup === 'kids' ? '🌲 Forest STEM Adventures' : '🚀 Space Academy STEM'}
        </h2>
        <p className="text-white/70">
          {ageGroup === 'kids' 
            ? 'Explore science, technology, engineering, art, and math through fun activities!'
            : 'Master advanced STEM concepts through hands-on projects and challenges!'
          }
        </p>
      </motion.div>

      {/* Activity Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map((activity) => (
          <motion.div
            key={activity.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-2xl border backdrop-blur-sm ${themeClasses.card} p-6 cursor-pointer transition-all`}
            onClick={() => startActivity(activity.id)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${activity.color} flex items-center justify-center`}>
                <activity.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{activity.title}</h3>
                <p className="text-white/60 text-sm">{activity.description}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className={`px-2 py-1 rounded-full text-xs ${
                activity.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                activity.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {activity.difficulty}
              </span>
              <span className="text-white/60">{activity.duration}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Embedded Learning Environment */}
      <AnimatePresence>
        {selectedActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-2xl border backdrop-blur-sm ${themeClasses.container} ${isFullscreen ? 'fixed inset-4 z-50' : 'p-6'}`}
          >
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                  activities.find(a => a.id === selectedActivity)?.color
                } flex items-center justify-center`}>
                  {selectedActivity && (() => {
                    const activity = activities.find(a => a.id === selectedActivity)
                    const IconComponent = activity?.icon
                    return IconComponent ? <IconComponent className="w-4 h-4 text-white" /> : null
                  })()}
                </div>
                <h3 className="text-lg font-bold text-white">
                  {activities.find(a => a.id === selectedActivity)?.title}
                </h3>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openInNewTab(activities.find(a => a.id === selectedActivity)?.embedUrl || '')}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  onClick={resetActivity}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                  title="Close"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br ${
                    activities.find(a => a.id === selectedActivity)?.color
                  } flex items-center justify-center animate-pulse`}>
                    {selectedActivity && (() => {
                      const activity = activities.find(a => a.id === selectedActivity)
                      const IconComponent = activity?.icon
                      return IconComponent ? <IconComponent className="w-6 h-6 text-white" /> : null
                    })()}
                  </div>
                  <p className="text-white/70">Loading interactive environment...</p>
                </div>
              </div>
            )}

            {/* Embedded Content */}
            {!isLoading && selectedActivity && (
              <div className={`bg-white rounded-lg overflow-hidden ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-96'}`}>
                <iframe
                  src={activities.find(a => a.id === selectedActivity)?.embedUrl}
                  className="w-full h-full border-0"
                  allow="fullscreen; camera; microphone; clipboard-read; clipboard-write"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
                  title={activities.find(a => a.id === selectedActivity)?.title}
                />
              </div>
            )}

            {/* Activity Info */}
            {!isLoading && (
              <div className="mt-4 p-4 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activities.find(a => a.id === selectedActivity)?.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-300' :
                      activities.find(a => a.id === selectedActivity)?.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {activities.find(a => a.id === selectedActivity)?.difficulty}
                    </span>
                    <span className="text-white/60">
                      {activities.find(a => a.id === selectedActivity)?.duration}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">
                    {activities.find(a => a.id === selectedActivity)?.description}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
