'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Camera, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useAppStore } from '@/lib/store'
import { TogetherAIService } from '@/lib/together-ai'
import toast from 'react-hot-toast'

interface AssignmentHelperProps {
  theme: 'forest' | 'space'
  ageGroup: 'kids' | 'teens'
  avatarId: string
}

export default function AssignmentHelper({ theme, ageGroup, avatarId }: AssignmentHelperProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [assignmentHelp, setAssignmentHelp] = useState<string>('')
  const [extractedText, setExtractedText] = useState<string>('')
  const [stepByStepGuide, setStepByStepGuide] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [textInput, setTextInput] = useState<string>('')
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload')
  const { assignments, addAssignment, updateAssignment, addMessage } = useAppStore()

  const processAssignment = async (textContent: string, fileName?: string) => {
    setIsProcessing(true)
    setIsAnalyzing(true)
    
    try {
      // Step 1: Set the extracted text
      setExtractedText(textContent)
      toast.success('Assignment content ready!', { id: 'extract' })

      // Step 2: Analyze the assignment and create step-by-step guide
      toast.loading('Analyzing assignment and creating learning guide...', { id: 'analyze' })
      
      const systemPrompt = ageGroup === 'kids'
        ? `You are a friendly, patient tutor helping a child (ages 5-12) with their homework. 
           - Look at this assignment text and create a step-by-step learning guide
           - Use simple, encouraging language
           - Break down complex problems into smaller, manageable steps
           - Ask guiding questions to help them think
           - Use examples and analogies they can relate to
           - Don't give direct answers, but guide them to discover the solution
           - Make learning fun and engaging
           - Format your response as a clear step-by-step guide with numbered steps`
        : `You are an advanced tutor helping a teenager (ages 13-18) with their assignment.
           - Analyze this assignment text and create a comprehensive step-by-step guide
           - Challenge their thinking with probing questions
           - Provide structured approaches to problem-solving
           - Encourage critical thinking and deeper understanding
           - Suggest multiple solution paths
           - Connect concepts to real-world applications
           - Format your response as a detailed step-by-step guide with numbered steps`

      const helpResponse = await TogetherAIService.chatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please analyze this assignment and create a step-by-step learning guide:\n\n${textContent}` }
      ])

      setAssignmentHelp(helpResponse || 'I can help you with this assignment! Let me analyze it and provide some guidance.')
      
      // Step 3: Break down the response into individual steps
      const steps = helpResponse
        .split(/\d+\.\s*/)
        .filter(step => step.trim().length > 0)
        .map(step => step.trim())
      
      setStepByStepGuide(steps)
      setCurrentStep(0)

      // Add to assignments
      addAssignment({
        title: fileName || `Assignment ${assignments.length + 1}`,
        subject: 'General',
        description: textContent,
        imageUrl: uploadedImage || undefined,
        status: 'in_progress'
      })

      // Add a message to the chat about the assignment help
      addMessage(avatarId, {
        role: 'assistant',
        content: `I've analyzed your assignment! I found ${steps.length} steps to help you work through it. Let's start with the first step and work through it together! 🎯`
      })

      toast.success('Assignment analyzed successfully! Ready to start learning!', { id: 'analyze' })
    } catch (error) {
      console.error('Assignment processing error:', error)
      toast.error('Failed to process assignment. Please try again.')
    } finally {
      setIsProcessing(false)
      setIsAnalyzing(false)
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadedFile(file)
    
    try {
      // Handle different file types
      if (file.type.startsWith('image/')) {
        // For images, use OCR
        toast.loading('Extracting text from your assignment image...', { id: 'extract' })
        
        // Convert file to base64 for display
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        const extractedText = await TogetherAIService.speechToText(file)
        await processAssignment(extractedText, file.name)
      } else if (file.type === 'application/pdf') {
        // For PDFs, we'll need to extract text (this is a simplified approach)
        toast.loading('Processing PDF document...', { id: 'extract' })
        
        // Convert file to base64 for display
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)

        // For now, we'll use a placeholder - in a real implementation, you'd use a PDF text extraction library
        const extractedText = `PDF Document: ${file.name}\n\n[PDF content would be extracted here. For now, please type your assignment in the text input below.]`
        await processAssignment(extractedText, file.name)
      } else if (file.type.includes('text') || file.type.includes('document')) {
        // For text files and documents
        toast.loading('Reading document content...', { id: 'extract' })
        
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          processAssignment(content, file.name)
        }
        reader.readAsText(file)
      } else {
        toast.error('Unsupported file format. Please try an image, PDF, or text document.')
      }
    } catch (error) {
      console.error('File processing error:', error)
      toast.error('Failed to process file. Please try again.')
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter your assignment text.')
      return
    }

    await processAssignment(textInput.trim(), 'Typed Assignment')
    setTextInput('')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.svg'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf']
    },
    multiple: false
  })

  const getThemeClasses = () => {
    if (theme === 'forest') {
      return {
        container: 'bg-green-500/10 border-green-500/20',
        button: 'bg-green-500 hover:bg-green-600 text-white',
        input: 'bg-green-500/10 border-green-500/30 text-white placeholder-green-200',
        dropzone: isDragActive 
          ? 'border-green-400 bg-green-500/20' 
          : 'border-green-500/30 bg-green-500/5'
      }
    } else {
      return {
        container: 'bg-blue-500/10 border-blue-500/20',
        button: 'bg-blue-500 hover:bg-blue-600 text-white',
        input: 'bg-blue-500/10 border-blue-500/30 text-white placeholder-blue-200',
        dropzone: isDragActive 
          ? 'border-blue-400 bg-blue-500/20' 
          : 'border-blue-500/30 bg-blue-500/5'
      }
    }
  }

  const themeClasses = getThemeClasses()

  return (
    <div className="space-y-6">
      {/* Input Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border backdrop-blur-sm ${themeClasses.container} p-4 sm:p-6`}
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
          <Camera className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Submit Your Assignment
        </h3>
        
        {/* Mode Toggle */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setInputMode('upload')}
            className={`px-4 py-2 rounded-lg transition-all ${
              inputMode === 'upload'
                ? `${themeClasses.button}`
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📁 Upload File
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-lg transition-all ${
              inputMode === 'text'
                ? `${themeClasses.button}`
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ✍️ Type Assignment
          </button>
        </div>

        {/* Upload Mode */}
        {inputMode === 'upload' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${themeClasses.dropzone}`}
          >
            <input {...getInputProps()} />
            {isProcessing ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium">
                    {isAnalyzing ? 'Analyzing your assignment...' : 'Processing your assignment...'}
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    {isAnalyzing ? 'Creating step-by-step learning guide' : 'Extracting text from file'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload className="w-12 h-12 text-white/60" />
                <div>
                  <p className="text-white font-medium">
                    {isDragActive ? 'Drop your assignment here' : 'Drag & drop your assignment here'}
                  </p>
                  <p className="text-white/60 text-sm mt-2">
                    Supports: Images, PDFs, Word docs, text files
                  </p>
                  <p className="text-white/40 text-xs mt-1">
                    or click to browse files
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Input Mode */}
        {inputMode === 'text' && (
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Type your assignment here:
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste or type your assignment text here..."
                className={`w-full h-32 px-4 py-3 rounded-lg border ${themeClasses.input} focus:outline-none focus:ring-2 focus:ring-white/20 resize-none`}
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className={`px-6 py-3 rounded-lg ${themeClasses.button} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Analyze Assignment'
              )}
            </button>
          </div>
        )}

        {/* File Preview */}
        {uploadedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4"
          >
            <img 
              src={uploadedImage} 
              alt="Uploaded assignment" 
              className="max-w-full h-auto rounded-lg border border-white/20"
            />
          </motion.div>
        )}

        {/* File Info */}
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <p className="text-white text-sm">
              <span className="font-medium">File:</span> {uploadedFile.name}
            </p>
            <p className="text-white/60 text-xs">
              <span className="font-medium">Type:</span> {uploadedFile.type}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Extracted Text Section */}
      {extractedText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border backdrop-blur-sm ${themeClasses.container} p-4 sm:p-6`}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Extracted Assignment Text
          </h3>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white leading-relaxed text-sm">{extractedText}</p>
          </div>
        </motion.div>
      )}

      {/* Step-by-Step Guide */}
      {stepByStepGuide.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border backdrop-blur-sm ${themeClasses.container} p-4 sm:p-6`}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Step-by-Step Learning Guide
          </h3>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-medium">
                Step {currentStep + 1} of {stepByStepGuide.length}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentStep(Math.min(stepByStepGuide.length - 1, currentStep + 1))}
                  disabled={currentStep === stepByStepGuide.length - 1}
                  className="px-3 py-1 rounded bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next →
                </button>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 border border-white/20">
              <p className="text-white leading-relaxed">
                {stepByStepGuide[currentStep]}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex space-x-2 justify-center">
            {stepByStepGuide.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-white scale-125' 
                    : index < currentStep 
                      ? 'bg-white/60' 
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Full Guide Section */}
      {assignmentHelp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border backdrop-blur-sm ${themeClasses.container} p-4 sm:p-6`}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Complete Learning Guide
          </h3>
          
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white leading-relaxed whitespace-pre-line">{assignmentHelp}</p>
          </div>
        </motion.div>
      )}

      {/* Assignment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border backdrop-blur-sm ${themeClasses.container} p-4 sm:p-6`}
      >
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Your Assignments</h3>
        
        {assignments.length === 0 ? (
          <p className="text-white/60 text-center py-8">No assignments yet. Upload one to get started!</p>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{assignment.title}</h4>
                    <p className="text-white/60 text-sm">{assignment.subject}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {assignment.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : assignment.status === 'in_progress' ? (
                      <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className={`text-sm ${
                      assignment.status === 'completed' ? 'text-green-400' :
                      assignment.status === 'in_progress' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
