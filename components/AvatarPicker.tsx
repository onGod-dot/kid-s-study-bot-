'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

export interface AvatarOption {
  id: string
  name: string
  emoji: string
  color: string
  description?: string
}

interface AvatarPickerProps {
  open: boolean
  onClose: () => void
  avatars: AvatarOption[]
  selectedId: string
  onSelect: (id: string) => void
  theme: 'forest' | 'space'
}

export default function AvatarPicker({
  open, onClose, avatars, selectedId, onSelect, theme
}: AvatarPickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const accent = theme === 'forest'
    ? { ring: 'ring-emerald-400', badge: 'from-emerald-500 to-green-600', glow: 'shadow-emerald-500/50' }
    : { ring: 'ring-blue-400', badge: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/50' }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full sm:max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-none flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 flex-shrink-0">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {theme === 'forest' ? '🌲 Choose Your Companion' : '🚀 Choose Your Mentor'}
                  </h2>
                  <p className="text-white/50 text-xs sm:text-sm mt-0.5">
                    Each one has their own chat history
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Avatar grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 px-5 sm:px-6 pb-6 overflow-y-auto">
                {avatars.map((av, i) => {
                  const isSelected = av.id === selectedId
                  return (
                    <motion.button
                      key={av.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.06, y: -4 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => { onSelect(av.id); onClose() }}
                      className={`relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${
                        isSelected
                          ? `bg-white/20 border-white/50 ring-2 ${accent.ring} shadow-lg ${accent.glow}`
                          : 'bg-white/5 border-white/10 hover:bg-white/15 hover:border-white/30'
                      }`}
                    >
                      {/* Selected checkmark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br ${accent.badge} flex items-center justify-center shadow-md`}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}

                      {/* Avatar circle */}
                      <motion.div
                        animate={isSelected ? { y: [0, -4, 0] } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${av.color} flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 ${isSelected ? 'border-white/40' : 'border-white/10'}`}
                      >
                        {av.emoji}
                      </motion.div>

                      <span className="text-white text-xs font-semibold text-center leading-tight">
                        {av.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
