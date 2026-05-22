'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, FileText, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useAppStore } from '@/lib/store'
import { TogetherAIService } from '@/lib/together-ai'
import toast from 'react-hot-toast'

interface AssignmentHelperProps {
  theme: 'forest' | 'space'
  ageGroup: 'kids' | 'teens'
  avatarId: string
}

// ── Shared markdown renderer (same logic as ChatBot) ─────────────────────────
function FormattedContent({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim() !== '')

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim()

        // Numbered list  e.g. "1. Something"
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
        if (numberedMatch) {
          return (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[11px] font-bold text-white mt-0.5">
                {numberedMatch[1]}
              </span>
              <span className="text-white/90 text-sm leading-relaxed">
                <InlineFormat text={numberedMatch[2]} />
              </span>
            </div>
          )
        }

        // Bullet list  e.g. "- item" or "* item"
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)/)
        if (bulletMatch) {
          return (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-white/50 mt-2.5" />
              <span className="text-white/90 text-sm leading-relaxed">
                <InlineFormat text={bulletMatch[1]} />
              </span>
            </div>
          )
        }

        // Heading  e.g. "## Title" or "### Title"
        const headingMatch = trimmed.match(/^#{1,3}\s+(.+)/)
        if (headingMatch) {
          return (
            <p key={i} className="text-white font-bold text-sm mt-3 mb-1">
              {headingMatch[1]}
            </p>
          )
        }

        // Regular paragraph
        return (
          <p key={i} className="text-white/90 text-sm leading-relaxed">
            <InlineFormat text={trimmed} />
          </p>
        )
      })}
    </div>
  )
}

// Handles **bold** first, then *italic* — prevents partial asterisk matches
function InlineFormat({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>
        }
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

// ── Step card — collapsible ───────────────────────────────────────────────────
function StepCard({
  number, title, content, isActive, accent,
}: {
  number: number
  title: string
  content: string
  isActive: boolean
  accent: string
}) {
  const [open, setOpen] = useState(isActive)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.05 }}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <span className={`flex-shrink-0 w-7 h-7 rounded-full ${accent} flex items-center justify-center text-xs font-bold text-white`}>
          {number}
        </span>
        <span className="flex-1 text-white text-sm font-semibold leading-snug">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/40 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-white/10">
              <FormattedContent text={content} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Parse AI response into titled steps ──────────────────────────────────────
// Handles: "1. Title\ncontent", "**Step 1: Title**\ncontent", "## Title\ncontent"
function parseSteps(text: string): { title: string; content: string }[] {
  // Split on numbered lines or bold step headers
  const chunks = text.split(/(?=\n?\s*(?:\d+\.\s|\*\*Step\s+\d+|\#{1,3}\s))/i).filter(c => c.trim())

  if (chunks.length <= 1) {
    // Fallback: split on double newlines as paragraphs
    const paras = text.split(/\n{2,}/).filter(p => p.trim())
    if (paras.length <= 1) return [{ title: 'Solution', content: text.trim() }]
    return paras.map((p, i) => {
      const firstLine = p.split('\n')[0].replace(/^[#*\d.\s]+/, '').trim()
      return { title: firstLine || `Part ${i + 1}`, content: p.trim() }
    })
  }

  return chunks.map(chunk => {
    const lines = chunk.trim().split('\n')
    const firstLine = lines[0]
      .replace(/^\d+\.\s*/, '')          // remove "1. "
      .replace(/^\*\*(.+?)\*\*$/, '$1')  // remove **...**
      .replace(/^#{1,3}\s*/, '')          // remove ###
      .trim()
    const title = firstLine || `Step ${chunks.indexOf(chunk) + 1}`
    const content = lines.slice(1).join('\n').trim() || firstLine
    return { title, content: content || chunk.trim() }
  })
}

export default function AssignmentHelper({ theme, ageGroup, avatarId }: AssignmentHelperProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [steps, setSteps] = useState<{ title: string; content: string }[]>([])
  const [fullResponse, setFullResponse] = useState('')
  const [textInput, setTextInput] = useState('')
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload')
  const [showFull, setShowFull] = useState(false)
  const { assignments, addAssignment, addMessage } = useAppStore()

  const processAssignment = async (textContent: string, fileName?: string) => {
    setIsProcessing(true)
    setSteps([])
    setFullResponse('')

    try {
      toast.loading('Analyzing your assignment...', { id: 'analyze' })

      const systemPrompt = ageGroup === 'kids'
        ? `You are a friendly tutor helping a child (ages 5–12) with homework.
RULES:
- Give the FULL answer AND show every step to get there.
- Use simple words a child understands.
- Number each step clearly: "1. Step title\nExplanation here."
- Keep each step short — 2-3 sentences max.
- Use 1 fun emoji per step.
- After the steps, give the final answer clearly labelled "✅ Answer:".
- No markdown asterisks in plain text — use numbered steps only.`
        : `You are an expert tutor helping a teenager (ages 13–18) with their assignment.
RULES:
- Give the COMPLETE solution with every step shown.
- Number each step: "1. Step title\nDetailed explanation."
- Use **bold** for key terms and formulas.
- Show working/calculations explicitly.
- After all steps, give the final answer clearly labelled "✅ Final Answer:".
- Be precise and thorough — teens need to understand the method, not just the result.`

      const response = await TogetherAIService.chatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Solve this assignment step by step and show the full answer:\n\n${textContent}` },
        ],
        undefined,
        800  // higher token limit for full solutions
      )

      const parsed = parseSteps(response)
      setSteps(parsed)
      setFullResponse(response)

      addAssignment({
        title: fileName || `Assignment ${assignments.length + 1}`,
        subject: 'General',
        description: textContent,
        imageUrl: uploadedImage || undefined,
        status: 'in_progress',
      })

      addMessage(avatarId, {
        role: 'assistant',
        content: `I've solved your assignment in ${parsed.length} steps — check the Homework tab! 🎯`,
      })

      toast.success('Done! Check the steps below.', { id: 'analyze' })
    } catch (error) {
      console.error('Assignment processing error:', error)
      toast.error('Failed to analyze assignment. Please try again.', { id: 'analyze' })
    } finally {
      setIsProcessing(false)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploadedFile(file)

    try {
      if (file.type.startsWith('image/')) {
        toast.loading('Reading your assignment image...', { id: 'extract' })
        const reader = new FileReader()
        reader.onload = (e) => setUploadedImage(e.target?.result as string)
        reader.readAsDataURL(file)
        const extracted = await TogetherAIService.speechToText(file)
        toast.dismiss('extract')
        await processAssignment(extracted, file.name)
      } else if (file.type.includes('text') || file.type.includes('document')) {
        toast.loading('Reading document...', { id: 'extract' })
        const reader = new FileReader()
        reader.onload = (e) => {
          toast.dismiss('extract')
          processAssignment(e.target?.result as string, file.name)
        }
        reader.readAsText(file)
      } else if (file.type === 'application/pdf') {
        toast.error('PDF support coming soon — please type your assignment instead.')
      } else {
        toast.error('Unsupported format. Try an image or text file.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to read file. Please try again.')
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) { toast.error('Please enter your assignment.'); return }
    await processAssignment(textInput.trim(), 'Typed Assignment')
    setTextInput('')
  }

  const reset = () => {
    setSteps([])
    setFullResponse('')
    setUploadedImage(null)
    setUploadedFile(null)
    setShowFull(false)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: false,
  })

  const tc = theme === 'forest'
    ? {
        container: 'bg-green-500/10 border-green-500/20',
        button: 'bg-green-500 hover:bg-green-600 text-white',
        input: 'bg-green-500/10 border-green-500/30 text-white placeholder-green-200/60',
        dropzone: isDragActive ? 'border-green-400 bg-green-500/20' : 'border-green-500/30 bg-green-500/5',
        accent: 'bg-emerald-500',
        accentText: 'text-emerald-400',
      }
    : {
        container: 'bg-blue-500/10 border-blue-500/20',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        input: 'bg-blue-500/10 border-blue-500/30 text-white placeholder-blue-200/60',
        dropzone: isDragActive ? 'border-blue-400 bg-blue-500/20' : 'border-blue-500/30 bg-blue-500/5',
        accent: 'bg-blue-500',
        accentText: 'text-blue-400',
      }

  return (
    <div className="space-y-5">

      {/* ── Input card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-4 sm:p-6`}>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5" />
            {ageGroup === 'kids' ? 'Homework Helper' : 'Assignment Solver'}
          </h3>
          {(steps.length > 0 || fullResponse) && (
            <button onClick={reset}
              className="flex items-center gap-1 text-white/40 hover:text-white/80 text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-all">
              <RotateCcw className="w-3 h-3" /> New
            </button>
          )}
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          {(['upload', 'text'] as const).map(mode => (
            <button key={mode} onClick={() => setInputMode(mode)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                inputMode === mode ? tc.button : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
              {mode === 'upload' ? '📁 Upload File' : '✍️ Type It'}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        {inputMode === 'upload' && (
          <div {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${tc.dropzone}`}>
            <input {...getInputProps()} />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
                <p className="text-white font-medium">Analyzing your assignment...</p>
                <p className="text-white/50 text-sm">Building step-by-step solution</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-white/40" />
                <p className="text-white font-medium">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your assignment'}
                </p>
                <p className="text-white/40 text-xs">Images, Word docs, text files · or click to browse</p>
              </div>
            )}
          </div>
        )}

        {/* Text input */}
        {inputMode === 'text' && (
          <div className="space-y-3">
            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder={ageGroup === 'kids'
                ? 'Type your homework question here...'
                : 'Paste your assignment or question here...'}
              className={`w-full h-36 px-4 py-3 rounded-xl border ${tc.input} focus:outline-none focus:ring-2 focus:ring-white/20 resize-none text-sm`}
              disabled={isProcessing}
            />
            <button onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className={`w-full py-3 rounded-xl font-semibold ${tc.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}>
              {isProcessing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Solving...</>
                : '🔍 Solve Assignment'}
            </button>
          </div>
        )}

        {/* Uploaded image preview */}
        {uploadedImage && (
          <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            src={uploadedImage} alt="Uploaded assignment"
            className="mt-4 max-w-full h-auto rounded-xl border border-white/20" />
        )}
      </motion.div>

      {/* ── Step-by-step solution ── */}
      {steps.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-4 sm:p-6`}>

          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {ageGroup === 'kids' ? '📚 Here\'s How to Solve It' : '📐 Step-by-Step Solution'}
          </h3>

          <div className="space-y-2">
            {steps.map((step, i) => (
              <StepCard
                key={i}
                number={i + 1}
                title={step.title}
                content={step.content}
                isActive={i === 0}
                accent={tc.accent}
              />
            ))}
          </div>

          {/* Toggle full raw response */}
          <button
            onClick={() => setShowFull(f => !f)}
            className="mt-4 flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors">
            {showFull ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showFull ? 'Hide full response' : 'Show full response'}
          </button>

          <AnimatePresence>
            {showFull && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <FormattedContent text={fullResponse} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Assignment history ── */}
      {assignments.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-4 sm:p-6`}>
          <h3 className="text-base font-bold text-white mb-3">Recent Assignments</h3>
          <div className="space-y-2">
            {assignments.slice(-5).reverse().map(a => (
              <div key={a.id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2.5 border border-white/10">
                <div>
                  <p className="text-white text-sm font-medium">{a.title}</p>
                  <p className="text-white/40 text-xs">{a.subject}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {a.status === 'completed'
                    ? <CheckCircle className="w-4 h-4 text-green-400" />
                    : a.status === 'in_progress'
                    ? <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                  <span className={`text-xs ${
                    a.status === 'completed' ? 'text-green-400' :
                    a.status === 'in_progress' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{a.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
