'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface ParticleSystemProps {
  count?: number
  colors?: string[]
  sizeRange?: [number, number]
  durationRange?: [number, number]
}

export default function ParticleSystem({
  count = 30,
  colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981'],
  sizeRange = [2, 6],
  durationRange = [4, 8],
}: ParticleSystemProps) {
  // Memoize particles — Math.random() in render causes infinite re-renders
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => {
      const seed = i / count
      return {
        id: i,
        x: (seed * 97 + 3) % 100,
        y: (seed * 83 + 7) % 100,
        size: sizeRange[0] + (seed * 7919) % (sizeRange[1] - sizeRange[0]),
        color: colors[i % colors.length],
        delay: (seed * 5),
        duration: durationRange[0] + (seed * 6271) % (durationRange[1] - durationRange[0]),
        // Pre-compute drift so it's stable across renders
        driftX: ((i * 17) % 30) - 15,
      }
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [count, sizeRange[0], sizeRange[1], durationRange[0], durationRange[1], colors.join()])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.6,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, p.driftX, 0],
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
