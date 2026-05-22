'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, BookOpen, Gamepad2, ImageIcon,
  Mic, ArrowRight, Star, Zap, Shield
} from 'lucide-react'
import KidsInterface from '@/components/KidsInterface'
import TeensInterface from '@/components/TeensInterface'
import { useSoundEffects } from '@/hooks/useSoundEffects'

// ── subtle grid dots ──────────────────────────────────────────────────────────
const DOT_GRID = `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`

// ── stagger helper ────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})

export default function Home() {
  const [selectedView, setSelectedView] = useState<'home' | 'kids' | 'teens'>('home')
  const [hovered, setHovered] = useState<string | null>(null)
  const { playClickSound, playSuccessSound } = useSoundEffects(true)

  if (selectedView === 'kids')  return <KidsInterface  onBack={() => setSelectedView('home')} />
  if (selectedView === 'teens') return <TeensInterface onBack={() => setSelectedView('home')} />

  const go = (view: 'kids' | 'teens') => {
    playSuccessSound()
    setSelectedView(view)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 pointer-events-none">
        {/* dot grid */}
        <div className="absolute inset-0" style={{ backgroundImage: DOT_GRID, backgroundSize: '28px 28px' }} />
        {/* colour blobs */}
        <motion.div animate={{ scale: [1,1.15,1], opacity:[0.18,0.28,0.18] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-700 blur-[120px]" />
        <motion.div animate={{ scale: [1,1.1,1], opacity:[0.12,0.22,0.12] }}
          transition={{ duration: 11, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-700 blur-[120px]" />
        <motion.div animate={{ scale: [1,1.08,1], opacity:[0.08,0.16,0.08] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-fuchsia-600 blur-[100px]" />
      </div>

      {/* ── Nav ── */}
      <motion.nav {...fadeUp(0)}
        className="relative z-20 flex items-center justify-between px-4 sm:px-10 lg:px-16 py-4 sm:py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-violet-500/30">
            🦉
          </div>
          <span className="text-lg font-black tracking-tight">Buddy</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-full px-1 py-1">
          {['Features', 'How it works', 'For Parents'].map(item => (
            <button key={item} className="px-4 py-1.5 rounded-full text-sm text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 sm:px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">AI Online</span>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 pt-12 sm:pt-28 pb-10 sm:pb-16 text-center">

        {/* Badge */}
        <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-400" />
          <span className="text-[10px] sm:text-xs font-semibold text-white/70 tracking-wide uppercase">Powered by Llama 3.3 · 70B</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.18)}
          className="text-3xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-4 sm:mb-6">
          <span className="text-white">The AI tutor that</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            makes learning click
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p {...fadeUp(0.26)}
          className="text-sm sm:text-lg text-white/50 max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2 sm:px-0">
          Buddy adapts to your child's age and learning style — guiding them through homework,
          sparking curiosity with games, and bringing concepts to life with AI-generated visuals.
        </motion.p>

        {/* CTA row */}
        <motion.div {...fadeUp(0.34)} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-10 sm:mb-16 px-2 sm:px-0">
          <button
            onClick={() => go('kids')}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>🌲</span> Start for Kids
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => go('teens')}
            className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>🚀</span> Start for Teens
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Social proof strip */}
        <motion.div {...fadeUp(0.42)} className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/30 text-xs font-medium">
          {[
            { icon: Star, text: 'Age-adaptive AI' },
            { icon: Shield, text: 'Safe for kids' },
            { icon: Zap, text: 'Instant responses' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 text-white/20" />
              {text}
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Audience cards ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-10 pb-12 sm:pb-20">
        <motion.div {...fadeUp(0.5)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

          {/* Kids card */}
          <motion.div
            onHoverStart={() => setHovered('kids')}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => go('kids')}
            className="group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 sm:p-8"
          >
            {/* card glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/10 group-hover:to-teal-500/5 transition-all duration-500 rounded-2xl sm:rounded-3xl" />
            {/* top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

            <div className="relative">
              {/* age badge */}
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4 sm:mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 text-xs font-bold">Ages 5 – 12</span>
              </div>

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-1">For Kids</h2>
                  <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                    Guided learning with friendly animal companions, fun games and visual explanations.
                  </p>
                </div>
                <motion.div
                  animate={hovered === 'kids' ? { rotate: [0,-8,8,0], scale:[1,1.15,1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-4xl sm:text-5xl ml-3 sm:ml-4 flex-shrink-0"
                >🌲</motion.div>
              </div>

              {/* feature chips */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {[
                  { icon: BookOpen, label: 'Homework help' },
                  { icon: Gamepad2, label: 'Learning games' },
                  { icon: ImageIcon, label: 'Draw anything' },
                  { icon: Mic,      label: 'Voice input' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/60">
                    <f.icon className="w-3 h-3 text-emerald-400" />
                    {f.label}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold group-hover:gap-3 transition-all">
                Enter Forest Academy
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

          {/* Teens card */}
          <motion.div
            onHoverStart={() => setHovered('teens')}
            onHoverEnd={() => setHovered(null)}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => go('teens')}
            className="group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 sm:p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/5 transition-all duration-500 rounded-2xl sm:rounded-3xl" />
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-4 sm:mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span className="text-blue-400 text-xs font-bold">Ages 13 – 18</span>
              </div>

              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-1">For Teens</h2>
                  <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                    Advanced STEM challenges, logic puzzles, science trivia and deep-dive explanations.
                  </p>
                </div>
                <motion.div
                  animate={hovered === 'teens' ? { rotate: [0,-8,8,0], scale:[1,1.15,1] } : {}}
                  transition={{ duration: 0.5 }}
                  className="text-4xl sm:text-5xl ml-3 sm:ml-4 flex-shrink-0"
                >🚀</motion.div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                {[
                  { icon: BookOpen, label: 'Assignment help' },
                  { icon: Gamepad2, label: 'STEM games' },
                  { icon: ImageIcon, label: 'Visual AI' },
                  { icon: Mic,      label: 'Voice input' },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white/60">
                    <f.icon className="w-3 h-3 text-blue-400" />
                    {f.label}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:gap-3 transition-all">
                Enter Space Academy
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <motion.footer {...fadeUp(0.6)}
        className="relative z-10 border-t border-white/[0.06] px-4 sm:px-10 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 text-white/20 text-xs">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs">🦉</div>
          <span>© 2025 Buddy AI · Built for curious minds</span>
        </div>
        <div className="flex items-center gap-4 text-white/20 text-xs">
          <span>Safe · Private · Ad-free</span>
        </div>
      </motion.footer>

    </div>
  )
}
