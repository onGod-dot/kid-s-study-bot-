'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiProps {
  active: boolean
  count?: number
}

const COLORS = ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#ef4444','#06b6d4','#84cc16']
const SHAPES = ['●', '■', '▲', '★', '♦']

export default function Confetti({ active, count = 36 }: ConfettiProps) {
  // Memoize pieces so they don't regenerate on every render
  const pieces = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      shape: SHAPES[i % SHAPES.length],
      x: (i / count) * 100 + (Math.random() * 8 - 4), // spread evenly + small jitter
      delay: (i / count) * 0.5,
      duration: 1.2 + (i % 4) * 0.2,
      rotate: (i % 2 === 0 ? 1 : -1) * (180 + (i % 3) * 90),
      size: 10 + (i % 5) * 3,
    })),
  [count])

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map(p => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ y: '110vh', opacity: 0, rotate: p.rotate, scale: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              style={{ position: 'absolute', top: 0, color: p.color, fontSize: p.size }}
            >
              {p.shape}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}
