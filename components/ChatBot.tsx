'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Loader2, Volume2, VolumeX, Paintbrush } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { TogetherAIService } from '@/lib/together-ai'
import Confetti from '@/components/Confetti'
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

// Typewriter component — streams text character by character
function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    setDisplayed('')
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])
  return <span>{displayed}</span>
}

export default function ChatBot({ theme, avatar, ageGroup }: ChatBotProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speakingId, setSpeakingId] = useState<string | null>(null)
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null)
  const [avatarBounce, setAvatarBounce] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [latestAssistantId, setLatestAssistantId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messagesByAvatar, addMessage, clearMessages, getMessages } = useAppStore()
  const messages = getMessages(avatar.id)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    // Bounce avatar when a new assistant message arrives
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') {
      setLatestAssistantId(last.id)
      setAvatarBounce(true)
      setTimeout(() => setAvatarBounce(false), 700)
    }
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

  // Detect image generation intent from user message
  const isImageRequest = (text: string): boolean => {
    return /\b(draw|drawing|sketch|paint|picture|image|illustration|generate\s+(?:an?\s+)?image|show\s+me|visuali[sz]e|create\s+(?:an?\s+)?image|make\s+(?:an?\s+)?image|picture\s+of|image\s+of|draw\s+(?:me\s+)?(?:an?\s+)?|generate\s+(?:me\s+)?(?:an?\s+)?)\b/i.test(text)
  }

  // Extract the subject to draw from the user's message
  const extractImageSubject = (text: string): string => {
    // Strip trigger words and return the rest as the subject
    return text
      .replace(/^(draw\s+(me\s+)?(an?\s+)?|generate\s+(me\s+)?(an?\s+)?image\s+(of\s+)?|create\s+(an?\s+)?image\s+(of\s+)?|show\s+me\s+(an?\s+)?|paint\s+(me\s+)?(an?\s+)?|sketch\s+(me\s+)?(an?\s+)?|picture\s+of\s+|image\s+of\s+|visuali[sz]e\s+)/i, '')
      .trim() || text
  }

  const handleImageRequest = async (userMessage: string) => {
    const subject = extractImageSubject(userMessage)

    // Show user message
    addMessage(avatar.id, { role: 'user', content: userMessage })

    // Show a friendly "drawing" response immediately
    const pendingId = Date.now().toString()
    addMessage(avatar.id, {
      role: 'assistant',
      content: `🎨 Let me draw that for you...`
    })

    setIsLoading(true)
    try {
      const imageUrl = await TogetherAIService.generateImage(subject)
      // Replace the pending message with the real one + image
      addMessage(avatar.id, {
        role: 'assistant',
        content: `Here's your illustration of "${subject}"! 🎨`,
        imageUrl
      })
      // 🎉 Celebrate!
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2200)
    } catch (error) {
      console.error('Image generation error:', error)
      addMessage(avatar.id, {
        role: 'assistant',
        content: `Sorry, I couldn't draw that right now. Try describing it differently!`
      })
      toast.error('Image generation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    // ── Image request shortcut ──────────────────────────────────────────────
    if (isImageRequest(userMessage)) {
      await handleImageRequest(userMessage)
      return
    }

    setIsLoading(true)

    // Snapshot history before adding the new message to avoid duplication
    const conversationHistory = messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))

    // Add user message to UI
    addMessage(avatar.id, {
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
      addMessage(avatar.id, {
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
      addMessage(avatar.id, {
        role: 'assistant',
        content: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateImage = async (messageId: string, messageContent: string) => {
    setGeneratingImageFor(messageId)
    try {
      // Ask the AI to summarise the concept into a short image prompt
      const promptResponse = await TogetherAIService.chatCompletion([
        {
          role: 'system',
          content: 'You are a prompt engineer. Given an educational explanation, write a SHORT (max 20 words) image generation prompt that visually illustrates the main concept. Return ONLY the prompt, nothing else.'
        },
        { role: 'user', content: messageContent }
      ])

      const imageUrl = await TogetherAIService.generateImage(promptResponse)

      // Add a new assistant message with the image scoped to this avatar
      addMessage(avatar.id, {
        role: 'assistant',
        content: `Here's a visual to help explain that! 🎨`,
        imageUrl
      })
      toast.success('Image generated!')
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2200)
    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('Could not generate image. Please try again.')
    } finally {
      setGeneratingImageFor(null)
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
      <Confetti active={showConfetti} />
      {/* Chat Header */}
      <div className="flex items-center space-x-2 sm:space-x-3 mb-4">
        <motion.div
          animate={avatarBounce ? { y: [0, -12, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-lg sm:text-xl lg:text-2xl shadow-lg`}
        >
          {avatar.emoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">{avatar.name}</h3>
          <p className="text-white/70 text-xs sm:text-sm">Your learning companion</p>
        </div>
        <button
          onClick={() => clearMessages(avatar.id)}
          className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm px-2 py-1 rounded"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="h-72 sm:h-80 lg:h-96 overflow-y-auto mb-4 space-y-3 sm:space-y-4">
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
                  {message.role === 'assistant' && message.id === latestAssistantId && !message.imageUrl ? (
                    <p className="text-white text-xs sm:text-sm break-words">
                      <TypewriterText text={message.content} speed={ageGroup === 'kids' ? 22 : 14} />
                    </p>
                  ) : (
                    <p className="text-white text-xs sm:text-sm break-words">{message.content}</p>
                  )}
                  {message.imageUrl && (
                    <img 
                      src={message.imageUrl} 
                      alt="Generated illustration" 
                      className="mt-3 rounded-xl max-w-full sm:max-w-xs border border-white/20 shadow-lg"
                    />
                  )}
                  <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                    <p className="text-white/50 text-xs">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-1">
                        {/* Draw it for me — only on messages without an image */}
                        {!message.imageUrl && (
                          <button
                            onClick={() => handleGenerateImage(message.id, message.content)}
                            disabled={generatingImageFor !== null}
                            title="Generate a visual illustration"
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all ${
                              generatingImageFor === message.id
                                ? 'text-white bg-white/20 animate-pulse cursor-not-allowed'
                                : 'text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-40'
                            }`}
                          >
                            {generatingImageFor === message.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Drawing...</span>
                              </>
                            ) : (
                              <>
                                <Paintbrush className="w-3 h-3" />
                                <span>Draw it</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleSpeak(message.id, message.content)}
                          title={speakingId === message.id ? 'Stop speaking' : 'Read aloud'}
                          className={`p-1 rounded-full transition-all ${
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center space-x-3 p-3 rounded-lg border mr-4 sm:mr-6 lg:mr-8 ${themeClasses.message.assistant}`}
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-sm flex-shrink-0`}>
              {avatar.emoji}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white/60 typing-dot" />
              <span className="w-2 h-2 rounded-full bg-white/60 typing-dot" />
              <span className="w-2 h-2 rounded-full bg-white/60 typing-dot" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex flex-row space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Ask ${avatar.name}...`}
          className={`flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-white/20 text-sm sm:text-base`}
          disabled={isLoading}
        />
        
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={handleVoiceInput}
            disabled={isListening || isLoading}
            className={`p-2.5 sm:p-3 rounded-lg border ${themeClasses.button} disabled:opacity-50`}
          >
            {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg border ${themeClasses.button} disabled:opacity-50`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
