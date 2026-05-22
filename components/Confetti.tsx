'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConfettiProps {
  active: boolean
  count?: number
}

const COLORS = ['#f59e0b','#10b981','#3b82f6','#ec4899','#8b5cf6','#ef4444','#06b6d4','#84cc16']
const SHAPES = ['●', '■', '▲', '★', '♦']

export default function Confetti({ active, count = 40 }: ConfettiProps) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8,
    rotate: Math.random() * 720 - 360,
    size: 10 + Math.random() * 14,
  }))

  return (
    <AnimatePresence>
      {active && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map(p => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 1 }}
              animate={{ y: '110vh', opacity: 0, rotate: p.rotate, scale: 0.5 }}
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
