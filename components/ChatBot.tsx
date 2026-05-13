'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Loader2, Volume2, VolumeX } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { TogetherAIService } from '@/lib/together-ai'
import toast from 'react-hot-toast'

interface ChatBotProps {
  theme: 'forest' | 'space'
  avatar: {
    id: string
    name: string
    emoji: string
    color: string
  }
  ageGroup: 'kids' | 'teens'
}

export default function ChatBot({ theme, avatar, ageGroup }: ChatBotProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, addMessage, clearMessages } = useAppStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSpeak = (messageId: string, text: string) => {
    // If already speaking this message, stop it
    if (speakingId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = ageGroup === 'kids' ? 0.85 : 1.0
    utterance.pitch = ageGroup === 'kids' ? 1.2 : 1.0
    utterance.volume = 1

    // Pick a friendly voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setSpeakingId(messageId)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)

    window.speechSynthesis.speak(utterance)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Snapshot history before adding the new message to avoid duplication
    const conversationHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    // Add user message to UI
    addMessage({
      role: 'user',
      content: userMessage
    })


    try {
      // Check if user is asking about assignments/homework
      const isAssignmentQuestion = /assignment|homework|problem|question|help|stuck|don't understand|confused/i.test(userMessage)
      
      // Create context-aware system message based on age group and theme
      let systemMessage = ageGroup === 'kids' 
        ? `You are ${avatar.name}, a friendly ${theme === 'forest' ? 'forest animal' : 'space being'} helping kids learn. Be encouraging, use simple language, and make learning fun with examples and analogies. Don't give direct answers but guide them to discover the answer themselves.`
        : `You are ${avatar.name}, an advanced ${theme === 'forest' ? 'forest creature' : 'cosmic mentor'} helping teens with complex subjects. Provide detailed explanations, challenge their thinking, and guide them through problem-solving processes. Encourage critical thinking and deeper understanding.`

      // Add assignment-specific guidance
      if (isAssignmentQuestion) {
        systemMessage += ageGroup === 'kids'
          ? `\n\nIf they're asking about homework or assignments, remind them that they can upload a photo of their assignment in the "Homework Help" tab to get step-by-step guidance! Be encouraging and suggest they try the assignment helper feature.`
          : `\n\nIf they're asking about assignments or homework, remind them that they can upload a photo of their assignment in the "Assignment Help" tab to get detailed step-by-step analysis and guidance! Encourage them to use the assignment helper for complex problems.`
      }

      const response = await TogetherAIService.chatCompletion([
        { role: 'system', content: systemMessage },
        // Include full conversation history for follow-up context
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ])

      // Validate response
      if (!response || response.trim() === '') {
        throw new Error('Empty response from AI')
      }

      // Add assistant response
      addMessage({
        role: 'assistant',
        content: response
      })

    } catch (error) {
      console.error('Chat error:', error)
      
      // More specific error messages
      let errorMessage = 'I apologize, but I had trouble processing that. Could you try again?'
      
      if (error instanceof Error) {
        if (error.message.includes('API Error')) {
          errorMessage = 'I\'m having trouble connecting to my AI brain right now. Please try again in a moment!'
        } else if (error.message.includes('Empty response')) {
          errorMessage = 'I received your message but couldn\'t generate a proper response. Could you try rephrasing your question?'
        } else if (error.message.includes('No response from AI model')) {
          errorMessage = 'My AI model seems to be taking a break. Please try again!'
        }
      }
      
      toast.error('Sorry, I had trouble understanding that. Please try again!')
      addMessage({
        role: 'assistant',
        content: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice input is not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      toast.loading('Listening...', { id: 'voice' })
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      toast.success('Voice input captured!', { id: 'voice' })
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      toast.error('Voice input failed. Please try again.', { id: 'voice' })
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }


  const getThemeClasses = () => {
    if (theme === 'forest') {
      return {
        container: 'bg-green-500/10 border-green-500/20',
        input: 'bg-green-500/10 border-green-500/30 text-white placeholder-green-200',
        button: 'bg-green-500 hover:bg-green-600 text-white',
        message: {
          user: 'bg-green-500/20 border-green-500/30',
          assistant: 'bg-green-600/20 border-green-600/30'
        }
      }
    } else {
      return {
        container: 'bg-blue-500/10 border-blue-500/20',
        input: 'bg-blue-500/10 border-blue-500/30 text-white placeholder-blue-200',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        message: {
          user: 'bg-blue-500/20 border-blue-500/30',
          assistant: 'bg-blue-600/20 border-blue-600/30'
        }
      }
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className={`rounded-2xl border backdrop-blur-sm ${themeClasses.container} p-4 sm:p-6`}>
      {/* Chat Header */}
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-lg sm:text-xl lg:text-2xl animate-float`}>
          {avatar.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">{avatar.name}</h3>
          <p className="text-white/70 text-xs sm:text-sm">Your learning companion</p>
        </div>
        <button
          onClick={clearMessages}
          className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 sm:h-80 lg:h-96 overflow-y-auto mb-4 space-y-3 sm:space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-3 sm:p-4 rounded-lg border ${
                message.role === 'user' 
                  ? `${themeClasses.message.user} ml-4 sm:ml-6 lg:ml-8` 
                  : `${themeClasses.message.assistant} mr-4 sm:mr-6 lg:mr-8`
              }`}
            >
              <div className="flex items-start space-x-3">
                {message.role === 'assistant' && (
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-sm sm:text-base lg:text-lg flex-shrink-0`}>
                    {avatar.emoji}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm break-words">{message.content}</p>
                  {message.imageUrl && (
                    <img 
                      src={message.imageUrl} 
                      alt="Generated content" 
                      className="mt-2 rounded-lg max-w-full sm:max-w-xs"
                    />
                  )}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-white/50 text-xs">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => handleSpeak(message.id, message.content)}
                        title={speakingId === message.id ? 'Stop speaking' : 'Read aloud'}
                        className={`ml-2 p-1 rounded-full transition-all ${
                          speakingId === message.id
                            ? 'text-white bg-white/20 animate-pulse'
                            : 'text-white/40 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {speakingId === message.id
                          ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                          : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 text-white/70"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{avatar.name} is thinking...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask ${avatar.name} anything...`}
          className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-white/20 text-sm sm:text-base`}
          disabled={isLoading}
        />
        
        <div className="flex space-x-2">
          <button
            onClick={handleVoiceInput}
            disabled={isListening || isLoading}
            className={`p-2 sm:p-3 rounded-lg border ${themeClasses.button} disabled:opacity-50`}
          >
            {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg border ${themeClasses.button} disabled:opacity-50`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
