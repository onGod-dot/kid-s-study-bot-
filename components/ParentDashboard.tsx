'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, BookOpen, Clock, TrendingUp, Award, Calendar, BarChart3, Eye } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function ParentDashboard({ onBack }: { onBack: () => void }) {
  const [selectedChild, setSelectedChild] = useState<string>('all')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const { assignments, progress } = useAppStore()

  // Mock data for demonstration
  const mockChildren = [
    { id: 'child1', name: 'Emma', age: 8, ageGroup: 'kids', avatar: 'owl' },
    { id: 'child2', name: 'Alex', age: 14, ageGroup: 'teens', avatar: 'astronaut' },
    { id: 'child3', name: 'Sophie', age: 10, ageGroup: 'kids', avatar: 'monkey' }
  ]

  const mockProgress = [
    {
      userId: 'child1',
      assignmentsCompleted: 12,
      timeSpent: 8.5,
      skillsLearned: ['Math', 'Science', 'Coding'],
      lastActivity: new Date('2024-01-15')
    },
    {
      userId: 'child2',
      assignmentsCompleted: 8,
      timeSpent: 12.3,
      skillsLearned: ['Python', 'Robotics', 'Data Analysis'],
      lastActivity: new Date('2024-01-14')
    },
    {
      userId: 'child3',
      assignmentsCompleted: 15,
      timeSpent: 6.7,
      skillsLearned: ['Art', 'Math', 'Reading'],
      lastActivity: new Date('2024-01-15')
    }
  ]

  const getTimeSpentColor = (hours: number) => {
    if (hours < 5) return 'text-red-400'
    if (hours < 10) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getProgressColor = (completed: number) => {
    if (completed < 5) return 'text-red-400'
    if (completed < 10) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Parent Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
            >
              <option value="all">All Children</option>
              {mockChildren.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Assignments</p>
                <p className="text-2xl font-bold text-white">
                  {mockProgress.reduce((sum, p) => sum + p.assignmentsCompleted, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Time Spent</p>
                <p className="text-2xl font-bold text-white">
                  {mockProgress.reduce((sum, p) => sum + p.timeSpent, 0).toFixed(1)}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Skills Learned</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(mockProgress.flatMap(p => p.skillsLearned)).size}
                </p>
              </div>
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Active Children</p>
                <p className="text-2xl font-bold text-white">
                  {mockChildren.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </motion.div>

        {/* Children Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Children Progress
            </h3>
            
            <div className="space-y-4">
              {mockChildren.map((child) => {
                const childProgress = mockProgress.find(p => p.userId === child.id)
                if (!childProgress) return null

                return (
                  <div key={child.id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold">{child.name[0]}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{child.name}</h4>
                          <p className="text-white/60 text-sm">Age {child.age} • {child.ageGroup}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getProgressColor(childProgress.assignmentsCompleted)}`}>
                          {childProgress.assignmentsCompleted} completed
                        </p>
                        <p className="text-white/60 text-xs">
                          {childProgress.timeSpent}h spent
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">Assignments</span>
                        <span className="text-white">{childProgress.assignmentsCompleted}/20</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(childProgress.assignmentsCompleted / 20) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Learning Analytics
            </h3>
            
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Most Active Time</h4>
                <p className="text-white/60 text-sm">3:00 PM - 5:00 PM</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Favorite Subjects</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Math', 'Science', 'Coding', 'Art'].map(subject => (
                    <span key={subject} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Learning Streak</h4>
                <p className="text-white/60 text-sm">7 days in a row! 🔥</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            {[
              { child: 'Emma', activity: 'Completed Math Assignment', time: '2 hours ago', type: 'success' },
              { child: 'Alex', activity: 'Started Python Coding Project', time: '4 hours ago', type: 'info' },
              { child: 'Sophie', activity: 'Finished Art Science Experiment', time: '6 hours ago', type: 'success' },
              { child: 'Emma', activity: 'Asked for help with Science homework', time: '1 day ago', type: 'help' },
              { child: 'Alex', activity: 'Completed Robotics Challenge', time: '2 days ago', type: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'info' ? 'bg-blue-400' : 'bg-yellow-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.child}: {activity.activity}</p>
                  <p className="text-white/60 text-sm">{activity.time}</p>
                </div>
                <Eye className="w-4 h-4 text-white/40" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
