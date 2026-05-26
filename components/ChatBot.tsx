'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Loader2, Volume2, VolumeX, Paintbrush, Download, ImagePlus, X, Pencil, Film } from 'lucide-react'
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

// ── Markdown-lite renderer ────────────────────────────────────────────────────
// Handles: **bold**, *italic*, bullet lists (- / *), numbered lists, line breaks
// Keeps output short and scannable — no raw asterisks shown to kids
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim() !== '')

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim()

        // Numbered list  e.g. "1. Something"
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
        if (numberedMatch) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">
                {numberedMatch[1]}
              </span>
              <span className="text-white/90 text-xs sm:text-sm leading-relaxed">
                <InlineFormat text={numberedMatch[2]} />
              </span>
            </div>
          )
        }

        // Bullet list  e.g. "- Something" or "* Something"
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/)
        if (bulletMatch) {
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/50 mt-2" />
              <span className="text-white/90 text-xs sm:text-sm leading-relaxed">
                <InlineFormat text={bulletMatch[1]} />
              </span>
            </div>
          )
        }

        // Heading-like line (starts with ### or ##)
        const headingMatch = trimmed.match(/^#{1,3}\s+(.+)/)
        if (headingMatch) {
          return (
            <p key={i} className="text-white font-bold text-xs sm:text-sm mt-1">
              {headingMatch[1]}
            </p>
          )
        }

        // Regular paragraph
        return (
          <p key={i} className="text-white/90 text-xs sm:text-sm leading-relaxed">
            <InlineFormat text={trimmed} />
          </p>
        )
      })}
    </div>
  )
}

// Handles **bold** and *italic* inline — order matters: match ** before *
function InlineFormat({ text }: { text: string }) {
  // Split on **bold** first, then *italic* — avoids partial asterisk matches
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        }
        // Now handle *italic* within non-bold segments
        const subParts = part.split(/(\*[^*]+\*)/g)
        return (
          <span key={i}>
            {subParts.map((sub, j) => {
              if (sub.startsWith('*') && sub.endsWith('*') && sub.length > 2) {
                return <em key={j} className="text-white/80 italic">{sub.slice(1, -1)}</em>
              }
              return <span key={j}>{sub}</span>
            })}
          </span>
        )
      })}
    </>
  )
}

// ── Typewriter — word-by-word so markdown tokens stay intact ─────────────────
// Character-by-character streaming breaks **bold** mid-token, showing raw asterisks.
// Word-by-word keeps tokens whole so InlineFormat always sees complete markers.
function TypewriterFormatted({ text, speed = 60 }: { text: string; speed?: number }) {
  const words = text.split(' ')
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(0)
    let i = 0
    const timer = setInterval(() => {
      i++
      setCount(i)
      if (i >= words.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  const displayed = words.slice(0, count).join(' ')
  return <FormattedMessage text={displayed} />
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
  // Attached image for upload/edit flow
  const [attachedImage, setAttachedImage] = useState<{ dataUrl: string; file: File } | null>(null)
  // Pending video jobs: messageId → jobId
  const [videoJobs, setVideoJobs] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addMessage, clearMessages, getMessages } = useAppStore()
  const messages = getMessages(avatar.id)

  // ── Download generated image via proxy ────────────────────────────────────
  const downloadImage = async (imageUrl: string, label: string) => {
    try {
      const res = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${label.replace(/\s+/g, '-').toLowerCase()}.png`
      a.click()
      URL.revokeObjectURL(a.href)
      toast.success('Image downloaded!')
    } catch {
      window.open(imageUrl, '_blank', 'noopener,noreferrer')
      toast('Opening image in new tab — right-click to save.', { icon: '🖼️' })
    }
  }

  // ── Handle image file picked from device ─────────────────────────────────
  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please pick an image file.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAttachedImage({ dataUrl: ev.target?.result as string, file })
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be re-picked
    e.target.value = ''
  }

  // ── Detect edit intent ────────────────────────────────────────────────────
  const isEditRequest = (text: string): boolean =>
    /\b(edit|change|modify|update|make it|turn it|add|remove|replace|transform|convert|recolor|redraw|redo|adjust)\b/i.test(text)

  // ── Upload image to Together AI via STT route (reuse base64 path) ─────────
  // We need a public URL for the edit API — upload via proxy or use data URL directly
  // FLUX.1-kontext-pro accepts base64 data URLs as image_url
  const getImageUrlForEdit = async (dataUrl: string): Promise<string> => {
    // Together AI's kontext model accepts data URLs directly
    return dataUrl
  }

  // ── Detect video generation intent ───────────────────────────────────────
  const isVideoRequest = (text: string): boolean =>
    /\b(make\s+a\s+video|create\s+a\s+video|generate\s+a\s+video|animate|video\s+of|video\s+clip|short\s+video|turn\s+into\s+video|bring\s+to\s+life)\b/i.test(text)

  // ── Start a video job and poll until done ─────────────────────────────────
  const handleVideoRequest = async (userMessage: string, sourceImageUrl?: string) => {
    const msgId = Date.now().toString()
    addMessage(avatar.id, { role: 'user', content: userMessage, ...(sourceImageUrl ? { imageUrl: sourceImageUrl } : {}) })

    // Placeholder message while generating
    const placeholderId = (Date.now() + 1).toString()
    addMessage(avatar.id, {
      role: 'assistant',
      content: ageGroup === 'kids'
        ? '🎬 Making your video... this takes about 1-2 minutes! ⏳'
        : '🎬 Generating your video — usually takes 1-2 minutes...',
    })

    setIsLoading(true)
    try {
      const jobId = await TogetherAIService.generateVideo(userMessage, ageGroup, sourceImageUrl)

      // Poll every 15 seconds
      const poll = async (): Promise<void> => {
        const result = await TogetherAIService.pollVideo(jobId)
        if (result.status === 'completed' && result.videoUrl) {
          addMessage(avatar.id, {
            role: 'assistant',
            content: `Here's your video! 🎬`,
            imageUrl: result.videoUrl, // reuse imageUrl field to store video URL
          })
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 2500)
          setIsLoading(false)
        } else if (result.status === 'failed') {
          addMessage(avatar.id, { role: 'assistant', content: `Sorry, the video failed to generate. Try a simpler description!` })
          toast.error('Video generation failed.')
          setIsLoading(false)
        } else {
          // Still in progress — poll again in 15s
          setTimeout(poll, 15000)
        }
      }

      setTimeout(poll, 15000)
    } catch (err) {
      console.error('Video error:', err)
      addMessage(avatar.id, { role: 'assistant', content: `Couldn't start video generation. Please try again!` })
      toast.error('Video generation failed.')
      setIsLoading(false)
    }
  }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    const last = messages[messages.length - 1]
    if (last?.role === 'assistant') {
      setLatestAssistantId(last.id)
      setAvatarBounce(true)
      setTimeout(() => setAvatarBounce(false), 700)
    }
  }, [messages])

  const handleSpeak = (messageId: string, text: string) => {
    if (speakingId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingId(null)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = ageGroup === 'kids' ? 0.85 : 1.0
    utterance.pitch = ageGroup === 'kids' ? 1.2 : 1.0
    utterance.volume = 1
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => setSpeakingId(messageId)
    utterance.onend = () => setSpeakingId(null)
    utterance.onerror = () => setSpeakingId(null)
    window.speechSynthesis.speak(utterance)
  }

  const isImageRequest = (text: string): boolean =>
    /\b(draw|drawing|sketch|paint|picture|image|illustration|generate\s+(?:an?\s+)?image|show\s+me|visuali[sz]e|create\s+(?:an?\s+)?image|make\s+(?:an?\s+)?image|picture\s+of|image\s+of|draw\s+(?:me\s+)?(?:an?\s+)?|generate\s+(?:me\s+)?(?:an?\s+)?)\b/i.test(text)

  const extractImageSubject = (text: string): string =>
    text.replace(/^(draw\s+(me\s+)?(an?\s+)?|generate\s+(me\s+)?(an?\s+)?image\s+(of\s+)?|create\s+(an?\s+)?image\s+(of\s+)?|show\s+me\s+(an?\s+)?|paint\s+(me\s+)?(an?\s+)?|sketch\s+(me\s+)?(an?\s+)?|picture\s+of\s+|image\s+of\s+|visuali[sz]e\s+)/i, '').trim() || text

  const handleImageRequest = async (userMessage: string) => {
    const subject = extractImageSubject(userMessage)
    addMessage(avatar.id, { role: 'user', content: userMessage })
    addMessage(avatar.id, { role: 'assistant', content: ageGroup === 'teens' ? '🖼️ Generating a realistic image for you...' : '🎨 Let me draw that for you...' })
    setIsLoading(true)
    try {
      const imageUrl = await TogetherAIService.generateImage(subject, ageGroup)
      addMessage(avatar.id, { role: 'assistant', content: `Here's your illustration of "${subject}"! 🎨`, imageUrl })
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2200)
    } catch (error) {
      console.error('Image generation error:', error)
      addMessage(avatar.id, { role: 'assistant', content: `Sorry, I couldn't generate that right now. Try describing it differently!` })
      toast.error('Image generation failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachedImage) || isLoading) return
    const userMessage = input.trim()
    setInput('')

    // ── Image EDIT: user attached an image + typed an instruction ────────────
    if (attachedImage && userMessage) {
      const imgData = attachedImage.dataUrl
      setAttachedImage(null)
      addMessage(avatar.id, {
        role: 'user',
        content: userMessage,
        imageUrl: imgData,
      })
      addMessage(avatar.id, {
        role: 'assistant',
        content: ageGroup === 'teens' ? '✏️ Editing your image...' : '🎨 Making changes to your image...',
      })
      setIsLoading(true)
      try {
        const editedUrl = await TogetherAIService.editImage(imgData, userMessage, ageGroup)
        addMessage(avatar.id, {
          role: 'assistant',
          content: `Here's your edited image! ✨`,
          imageUrl: editedUrl,
        })
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 2200)
      } catch (err) {
        console.error('Edit image error:', err)
        addMessage(avatar.id, {
          role: 'assistant',
          content: `Sorry, I couldn't edit that image. Try a different description!`,
        })
        toast.error('Image edit failed. Please try again.')
      } finally {
        setIsLoading(false)
      }
      return
    }

    // ── Image UPLOAD with no instruction: describe the image ─────────────────
    if (attachedImage && !userMessage) {
      const imgData = attachedImage.dataUrl
      setAttachedImage(null)
      addMessage(avatar.id, {
        role: 'user',
        content: '📎 What can you tell me about this image?',
        imageUrl: imgData,
      })
      addMessage(avatar.id, {
        role: 'assistant',
        content: ageGroup === 'kids'
          ? `That's a cool image! 🖼️ To edit it, type what changes you'd like and attach it again — like "make it night time" or "add a rainbow"!`
          : `Image received! To edit it, attach it again and describe the changes you want — e.g. "change the background to space" or "make it more vibrant".`,
      })
      return
    }

    // ── Image-to-video: user attached an image + asked for a video ───────────
    if (attachedImage && isVideoRequest(userMessage)) {
      const imgData = attachedImage.dataUrl
      setAttachedImage(null)
      setInput('')
      await handleVideoRequest(userMessage, imgData)
      return
    }

    // ── Text-to-video ─────────────────────────────────────────────────────────
    if (isVideoRequest(userMessage)) {
      setInput('')
      await handleVideoRequest(userMessage)
      return
    }

    // ── Text-only image generation ────────────────────────────────────────────
    if (isImageRequest(userMessage)) {
      await handleImageRequest(userMessage)
      return
    }

    setIsLoading(true)
    const conversationHistory = messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    addMessage(avatar.id, { role: 'user', content: userMessage })

    try {
      const isAssignmentQuestion = /assignment|homework|problem|question|help|stuck|don't understand|confused/i.test(userMessage)

      // ── System prompt: short, friendly, formatted ──────────────────────────
      let systemMessage = ageGroup === 'kids'
        ? `You are ${avatar.name}, a friendly ${theme === 'forest' ? 'forest animal' : 'space friend'} who helps kids aged 5-12 learn.
RULES:
- Keep answers SHORT — max 4 sentences or 4 bullet points.
- Use simple words a child understands.
- Use 1-2 fun emojis per reply.
- If listing steps or facts, use a short bullet list (- item).
- Never write long paragraphs. Break ideas into small pieces.
- Guide kids to think, don't just give the answer.
- Be warm, encouraging and playful.`
        : `You are ${avatar.name}, a smart ${theme === 'forest' ? 'forest mentor' : 'cosmic guide'} helping teens aged 13-18.
RULES:
- Keep answers focused — max 6 bullet points or 3 short paragraphs.
- Use bullet lists for steps or multiple facts.
- Bold key terms with **term**.
- Be direct and clear, no filler sentences.
- Encourage critical thinking with a follow-up question when relevant.`

      if (isAssignmentQuestion) {
        systemMessage += ageGroup === 'kids'
          ? `\n- If it's about homework, mention the 📚 Homework tab for photo upload.`
          : `\n- If it's about an assignment, mention the 📚 Assignment tab for photo upload.`
      }

      const response = await TogetherAIService.chatCompletion([
        { role: 'system', content: systemMessage },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ])

      if (!response || response.trim() === '') throw new Error('Empty response from AI')

      addMessage(avatar.id, { role: 'assistant', content: response })
    } catch (error) {
      console.error('Chat error:', error)
      let errorMessage = 'Oops! Something went wrong. Try again? 😊'
      if (error instanceof Error) {
        if (error.message.includes('API Error')) errorMessage = 'Having trouble connecting right now. Try again in a moment!'
        else if (error.message.includes('Empty response')) errorMessage = 'I got confused there! Could you ask again?'
      }
      toast.error('Something went wrong. Please try again!')
      addMessage(avatar.id, { role: 'assistant', content: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateImage = async (messageId: string, messageContent: string) => {
    setGeneratingImageFor(messageId)
    try {
      const promptResponse = await TogetherAIService.chatCompletion([
        { role: 'system', content: 'Write a SHORT (max 15 words) image prompt that visually illustrates the main concept. Return ONLY the prompt.' },
        { role: 'user', content: messageContent }
      ])
      const imageUrl = await TogetherAIService.generateImage(promptResponse, ageGroup)
      addMessage(avatar.id, { role: 'assistant', content: `Here's a visual to help explain that! 🎨`, imageUrl })
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
    recognition.onstart = () => { setIsListening(true); toast.loading('Listening...', { id: 'voice' }) }
    recognition.onresult = (event: any) => { setInput(event.results[0][0].transcript); toast.success('Got it!', { id: 'voice' }) }
    recognition.onerror = (event: any) => { console.error(event.error); toast.error('Voice failed. Try again.', { id: 'voice' }); setIsListening(false) }
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  const getThemeClasses = () => {
    if (theme === 'forest') return {
      container: 'bg-green-500/10 border-green-500/20',
      input: 'bg-green-500/10 border-green-500/30 text-white placeholder-green-200/60',
      button: 'bg-green-500 hover:bg-green-600 text-white',
      userBubble: 'bg-emerald-500/25 border-emerald-500/30 rounded-2xl rounded-tr-sm',
      assistantBubble: 'bg-white/[0.07] border-white/10 rounded-2xl rounded-tl-sm',
    }
    return {
      container: 'bg-blue-500/10 border-blue-500/20',
      input: 'bg-blue-500/10 border-blue-500/30 text-white placeholder-blue-200/60',
      button: 'bg-blue-500 hover:bg-blue-600 text-white',
      userBubble: 'bg-blue-500/25 border-blue-500/30 rounded-2xl rounded-tr-sm',
      assistantBubble: 'bg-white/[0.07] border-white/10 rounded-2xl rounded-tl-sm',
    }
  }

  const tc = getThemeClasses()

  return (
    <div className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-4 sm:p-6`}>
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4">
        <motion.div
          animate={avatarBounce ? { y: [0, -12, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-lg sm:text-xl shadow-lg flex-shrink-0`}
        >
          {avatar.emoji}
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-white truncate">{avatar.name}</h3>
          <p className="text-white/50 text-xs">Your learning companion</p>
        </div>
        <button
          onClick={() => clearMessages(avatar.id)}
          className="text-white/40 hover:text-white/80 transition-colors text-xs px-2 py-1 rounded-lg hover:bg-white/10"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="h-72 sm:h-80 lg:h-96 overflow-y-auto mb-4 space-y-3 pr-1 scrollbar-none">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center gap-3 py-8"
            >
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-3xl shadow-lg`}>
                {avatar.emoji}
              </div>
              <p className="text-white/60 text-sm font-medium">Hi! I'm {avatar.name} 👋</p>
              <p className="text-white/30 text-xs max-w-[200px]">Ask me anything — I'll keep it simple and fun!</p>
            </motion.div>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Assistant avatar dot */}
              {message.role === 'assistant' && (
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-sm flex-shrink-0 mt-1 mr-2`}>
                  {avatar.emoji}
                </div>
              )}

              <div className={`max-w-[82%] sm:max-w-[78%]`}>
                <div className={`px-3 py-2.5 border ${message.role === 'user' ? tc.userBubble : tc.assistantBubble}`}>
                  {/* Show attached image in user bubble */}
                  {message.role === 'user' && message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Uploaded"
                      className="mb-2 rounded-xl max-w-[180px] border border-white/20 shadow"
                    />
                  )}
                  {/* Content */}
                  {message.role === 'assistant' && message.id === latestAssistantId && !message.imageUrl ? (
                    <TypewriterFormatted text={message.content} speed={ageGroup === 'kids' ? 16 : 10} />
                  ) : (
                    message.role === 'assistant'
                      ? <FormattedMessage text={message.content} />
                      : <p className="text-white text-xs sm:text-sm leading-relaxed">{message.content}</p>
                  )}

                  {message.imageUrl && message.role === 'assistant' && (
                    <div className="mt-2 space-y-2">
                      {/* Video or image */}
                      {message.imageUrl.includes('.mp4') || message.imageUrl.includes('video') ? (
                        <video
                          src={message.imageUrl}
                          controls
                          autoPlay
                          loop
                          className="rounded-xl max-w-full border border-white/20 shadow-lg w-full"
                        />
                      ) : (
                        <img
                          src={message.imageUrl}
                          alt="Generated illustration"
                          className="rounded-xl max-w-full border border-white/20 shadow-lg"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadImage(message.imageUrl!, message.content)}
                          className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all justify-center"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                        {/* Only show Edit for images, not videos */}
                        {!message.imageUrl.includes('.mp4') && !message.imageUrl.includes('video') && (
                          <>
                            <button
                              onClick={() => {
                                fetch(`/api/proxy-image?url=${encodeURIComponent(message.imageUrl!)}`)
                                  .then(r => r.blob())
                                  .then(blob => {
                                    const file = new File([blob], 'image.png', { type: 'image/png' })
                                    const reader = new FileReader()
                                    reader.onload = e => setAttachedImage({ dataUrl: e.target?.result as string, file })
                                    reader.readAsDataURL(file)
                                    toast('Image loaded — type your edit instruction below!', { icon: '✏️' })
                                  })
                                  .catch(() => toast.error('Could not load image for editing.'))
                              }}
                              className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all justify-center"
                            >
                              <Pencil className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                fetch(`/api/proxy-image?url=${encodeURIComponent(message.imageUrl!)}`)
                                  .then(r => r.blob())
                                  .then(blob => {
                                    const file = new File([blob], 'image.png', { type: 'image/png' })
                                    const reader = new FileReader()
                                    reader.onload = e => {
                                      setAttachedImage({ dataUrl: e.target?.result as string, file })
                                      setInput('animate this image with smooth natural motion')
                                      toast('Ready — tap Send to animate!', { icon: '🎬' })
                                    }
                                    reader.readAsDataURL(file)
                                  })
                                  .catch(() => toast.error('Could not load image.'))
                              }}
                              className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-medium transition-all justify-center"
                            >
                              <Film className="w-3 h-3" />
                              Animate
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions row */}
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-white/25 text-[10px]">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {!message.imageUrl && (
                        <button
                          onClick={() => handleGenerateImage(message.id, message.content)}
                          disabled={generatingImageFor !== null}
                          title="Visualise this"
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] transition-all ${
                            generatingImageFor === message.id
                              ? 'text-white bg-white/20 animate-pulse cursor-not-allowed'
                              : 'text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-30'
                          }`}
                        >
                          {generatingImageFor === message.id
                            ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Drawing...</>
                            : <><Paintbrush className="w-2.5 h-2.5" /> Draw it</>
                          }
                        </button>
                      )}
                      <button
                        onClick={() => handleSpeak(message.id, message.content)}
                        title={speakingId === message.id ? 'Stop' : 'Read aloud'}
                        className={`p-1 rounded-full transition-all ${
                          speakingId === message.id ? 'text-white bg-white/20 animate-pulse' : 'text-white/30 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {speakingId === message.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-sm flex-shrink-0`}>
              {avatar.emoji}
            </div>
            <div className={`px-4 py-3 border ${tc.assistantBubble} flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 typing-dot" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 typing-dot" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached image preview */}
      <AnimatePresence>
        {attachedImage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="mb-2 relative inline-flex"
          >
            <img
              src={attachedImage.dataUrl}
              alt="Attached"
              className="h-16 w-16 rounded-xl object-cover border border-white/20 shadow-lg"
            />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 rounded-b-xl px-1 py-0.5 text-center">
              <span className="text-white/80 text-[9px]">
                {input.trim() ? 'Edit mode ✏️' : 'Describe to edit'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex flex-row gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImagePick}
        />

        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Upload image to edit"
          className={`p-2.5 sm:p-3 rounded-xl border ${tc.button} disabled:opacity-50 flex-shrink-0`}
        >
          {attachedImage
            ? <Pencil className="w-4 h-4" />
            : <ImagePlus className="w-4 h-4" />
          }
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={
            attachedImage
              ? 'Describe your edit (e.g. "make it night time")...'
              : ageGroup === 'kids' ? `Ask ${avatar.name} anything! 🌟` : `Ask ${avatar.name}...`
          }
          className={`flex-1 min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border ${tc.input} focus:outline-none focus:ring-2 focus:ring-white/20 text-sm`}
          disabled={isLoading}
        />
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleVoiceInput}
            disabled={isListening || isLoading}
            className={`p-2.5 sm:p-3 rounded-xl border ${tc.button} disabled:opacity-50`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSendMessage}
            disabled={(!input.trim() && !attachedImage) || isLoading}
            className={`px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl border ${tc.button} disabled:opacity-50`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}