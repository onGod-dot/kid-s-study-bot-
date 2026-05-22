'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy, Star, Zap, Brain, Puzzle, Hash, BookOpen } from 'lucide-react'

interface GamesSectionProps {
  theme: 'forest' | 'space'
  ageGroup: 'kids' | 'teens'
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ─── KIDS GAME 1 – Number Bubble Pop ──────────────────────────────────────────
function BubblePopGame({ theme }: { theme: string }) {
  const [target, setTarget] = useState(0)
  const [bubbles, setBubbles] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [round, setRound] = useState(1)

  const newRound = useCallback(() => {
    const t = Math.floor(Math.random() * 10) + 1
    const wrong = Array.from({ length: 5 }, () => {
      let n: number
      do { n = Math.floor(Math.random() * 15) + 1 } while (n === t)
      return n
    })
    setBubbles(shuffle([t, ...wrong]))
    setTarget(t)
    setFeedback('')
  }, [])

  useEffect(() => { newRound() }, [newRound])

  const pop = (n: number) => {
    if (n === target) {
      setScore(s => s + 10)
      setFeedback('🎉 Correct!')
      setRound(r => r + 1)
      setTimeout(newRound, 800)
    } else {
      setFeedback('❌ Try again!')
    }
  }

  const accent = theme === 'forest' ? 'text-green-300' : 'text-blue-300'
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Round {round}</span>
        <span className={`font-bold text-lg ${accent}`}>⭐ {score}</span>
      </div>
      <p className="text-white text-xl font-bold">Pop the bubble showing <span className={accent}>{target}</span></p>
      <div className="flex flex-wrap justify-center gap-4">
        {bubbles.map((n, i) => (
          <motion.button key={i} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
            onClick={() => pop(n)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-2xl font-bold shadow-lg hover:shadow-xl transition-all">
            {n}
          </motion.button>
        ))}
      </div>
      {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white text-lg font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ─── KIDS GAME 2 – Memory Match ───────────────────────────────────────────────
const EMOJIS = ['🐶','🐱','🐸','🦊','🐻','🦁','🐼','🐨']

function MemoryMatchGame({ theme }: { theme: string }) {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  const init = useCallback(() => {
    const deck = shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({
      id: i, emoji, flipped: false, matched: false
    }))
    setCards(deck)
    setSelected([])
    setMoves(0)
    setWon(false)
  }, [])

  useEffect(() => { init() }, [init])

  const flip = (id: number) => {
    if (selected.length === 2) return
    const card = cards[id]
    if (card.flipped || card.matched) return
    const next = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
    const newSel = [...selected, id]
    setCards(next)
    setSelected(newSel)
    if (newSel.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = newSel
      if (next[a].emoji === next[b].emoji) {
        const matched = next.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c)
        setCards(matched)
        setSelected([])
        if (matched.every(c => c.matched)) setWon(true)
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, flipped: false } : c))
          setSelected([])
        }, 900)
      }
    }
  }

  const accent = theme === 'forest' ? 'text-green-300' : 'text-blue-300'
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Moves: {moves}</span>
        <button onClick={init} className="text-white/60 hover:text-white text-sm flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
      </div>
      {won && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-center text-xl font-bold ${accent}`}>🎉 You matched them all in {moves} moves!</motion.div>}
      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <motion.button key={card.id} whileTap={{ scale: 0.9 }} onClick={() => flip(card.id)}
            className={`h-14 rounded-xl text-2xl font-bold transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                : 'bg-white/10 border border-white/20 hover:bg-white/20'
            } ${card.matched ? 'opacity-50' : ''}`}>
            {card.flipped || card.matched ? card.emoji : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── KIDS GAME 3 – Word Scramble ──────────────────────────────────────────────
const KIDS_WORDS = [
  { word: 'CAT', hint: '🐱 A furry pet that meows' },
  { word: 'DOG', hint: '🐶 A loyal pet that barks' },
  { word: 'SUN', hint: '☀️ It shines in the sky' },
  { word: 'TREE', hint: '🌳 It has leaves and branches' },
  { word: 'FISH', hint: '🐟 It swims in water' },
  { word: 'BIRD', hint: '🐦 It has wings and can fly' },
  { word: 'STAR', hint: '⭐ It twinkles at night' },
  { word: 'FROG', hint: '🐸 It jumps and says ribbit' },
]

function WordScrambleKids({ theme }: { theme: string }) {
  const [idx, setIdx] = useState(0)
  const [scrambled, setScrambled] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)

  const current = KIDS_WORDS[idx % KIDS_WORDS.length]

  useEffect(() => {
    setScrambled(shuffle(current.word.split('')).join(''))
    setInput('')
    setFeedback('')
  }, [idx])

  const check = () => {
    if (input.toUpperCase() === current.word) {
      setScore(s => s + 10)
      setFeedback('🎉 Correct!')
      setTimeout(() => setIdx(i => i + 1), 900)
    } else {
      setFeedback('❌ Try again!')
    }
  }

  const accent = theme === 'forest' ? 'from-green-400 to-emerald-500' : 'from-blue-400 to-cyan-500'
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Word {(idx % KIDS_WORDS.length) + 1}/{KIDS_WORDS.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <p className="text-white/70 text-sm">{current.hint}</p>
      <div className="flex justify-center gap-2">
        {scrambled.split('').map((l, i) => (
          <span key={i} className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold text-lg shadow`}>{l}</span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
        onKeyDown={e => e.key === 'Enter' && check()}
        placeholder="Type the word..."
        className="w-full max-w-xs mx-auto block px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-white/30" />
      <button onClick={check} className={`px-6 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow hover:opacity-90 transition`}>Check</button>
      {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ─── KIDS GAME 4 – Simple Quiz ────────────────────────────────────────────────
const KIDS_QUIZ = [
  { q: 'How many legs does a spider have?', options: ['4','6','8','10'], answer: '8' },
  { q: 'What color do you get mixing red and blue?', options: ['Green','Purple','Orange','Pink'], answer: 'Purple' },
  { q: 'Which planet is closest to the Sun?', options: ['Earth','Venus','Mercury','Mars'], answer: 'Mercury' },
  { q: 'How many sides does a triangle have?', options: ['2','3','4','5'], answer: '3' },
  { q: 'What do caterpillars turn into?', options: ['Bees','Butterflies','Moths','Dragonflies'], answer: 'Butterflies' },
  { q: 'Which is the largest ocean?', options: ['Atlantic','Indian','Arctic','Pacific'], answer: 'Pacific' },
]

function KidsQuiz({ theme }: { theme: string }) {
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const q = KIDS_QUIZ[qi]

  const pick = (opt: string) => {
    if (chosen) return
    setChosen(opt)
    if (opt === q.answer) setScore(s => s + 10)
    setTimeout(() => {
      if (qi + 1 >= KIDS_QUIZ.length) { setDone(true) }
      else { setQi(i => i + 1); setChosen(null) }
    }, 900)
  }

  const reset = () => { setQi(0); setScore(0); setChosen(null); setDone(false) }

  const accent = theme === 'forest' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
  if (done) return (
    <div className="text-center space-y-4">
      <p className="text-4xl">🏆</p>
      <p className="text-white text-xl font-bold">Quiz Complete!</p>
      <p className="text-yellow-300 text-lg">Score: {score} / {KIDS_QUIZ.length * 10}</p>
      <button onClick={reset} className={`px-6 py-2 rounded-xl ${accent} text-white font-bold`}>Play Again</button>
    </div>
  )
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Q {qi + 1}/{KIDS_QUIZ.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <p className="text-white font-semibold text-lg">{q.q}</p>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.95 }} onClick={() => pick(opt)}
            className={`py-3 px-4 rounded-xl text-white font-medium transition-all ${
              chosen === null ? `${accent} shadow` :
              opt === q.answer ? 'bg-green-500' :
              opt === chosen ? 'bg-red-500' : 'bg-white/10 opacity-50'
            }`}>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── TEENS GAME 1 – Math Speed Challenge ──────────────────────────────────────
function MathChallenge({ theme }: { theme: string }) {
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [q, setQ] = useState({ text: '', answer: 0 })
  const [timeLeft, setTimeLeft] = useState(30)
  const [active, setActive] = useState(false)

  const genQ = useCallback(() => {
    const ops = ['+', '-', '×', '÷']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let a: number, b: number, answer: number, text: string
    if (op === '+') { a = Math.floor(Math.random() * 50) + 1; b = Math.floor(Math.random() * 50) + 1; answer = a + b; text = `${a} + ${b}` }
    else if (op === '-') { a = Math.floor(Math.random() * 50) + 20; b = Math.floor(Math.random() * 20) + 1; answer = a - b; text = `${a} - ${b}` }
    else if (op === '×') { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; answer = a * b; text = `${a} × ${b}` }
    else { b = Math.floor(Math.random() * 11) + 2; answer = Math.floor(Math.random() * 10) + 1; a = b * answer; text = `${a} ÷ ${b}` }
    setQ({ text, answer })
    setInput('')
    setFeedback('')
  }, [])

  const start = () => { setScore(0); setStreak(0); setTimeLeft(30); setActive(true); genQ() }

  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setTimeLeft(s => { if (s <= 1) { clearInterval(t); setActive(false); return 0 } return s - 1 }), 1000)
    return () => clearInterval(t)
  }, [active])

  const submit = () => {
    if (!active) return
    const val = parseInt(input)
    if (val === q.answer) {
      const bonus = streak >= 3 ? 20 : 10
      setScore(s => s + bonus)
      setStreak(s => s + 1)
      setFeedback(streak >= 2 ? '🔥 On fire!' : '✅ Correct!')
    } else {
      setStreak(0)
      setFeedback(`❌ Answer: ${q.answer}`)
    }
    setTimeout(genQ, 600)
  }

  const accent = theme === 'forest' ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-indigo-600'
  const barColor = timeLeft > 15 ? 'bg-green-400' : timeLeft > 8 ? 'bg-yellow-400' : 'bg-red-400'

  if (!active && score === 0 && timeLeft === 30) return (
    <div className="text-center space-y-4">
      <p className="text-white text-lg">Solve as many math problems as you can in 30 seconds!</p>
      <p className="text-white/60 text-sm">Streaks give bonus points 🔥</p>
      <button onClick={start} className={`px-8 py-3 rounded-xl bg-gradient-to-r ${accent} text-white font-bold text-lg shadow-lg`}>Start!</button>
    </div>
  )
  if (!active) return (
    <div className="text-center space-y-4">
      <p className="text-4xl">🏆</p>
      <p className="text-white text-xl font-bold">Time's up!</p>
      <p className="text-yellow-300 text-2xl font-bold">{score} points</p>
      <button onClick={start} className={`px-6 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold`}>Play Again</button>
    </div>
  )
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-yellow-300 font-bold text-lg">⭐ {score}</span>
        {streak >= 2 && <span className="text-orange-400 font-bold">🔥 {streak} streak</span>}
        <span className={`font-bold ${timeLeft <= 8 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2"><div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${(timeLeft / 30) * 100}%` }} /></div>
      <p className="text-white text-3xl font-bold text-center py-4">{q.text} = ?</p>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
        type="number" placeholder="Your answer..."
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-white/30" autoFocus />
      <button onClick={submit} className={`w-full py-3 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow`}>Submit</button>
      {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ─── TEENS GAME 2 – Word Scramble (harder) ────────────────────────────────────
const TEEN_WORDS = [
  { word: 'PHOTOSYNTHESIS', hint: '🌿 How plants make food from sunlight' },
  { word: 'DEMOCRACY', hint: '🗳️ A system of government by the people' },
  { word: 'ALGORITHM', hint: '💻 A step-by-step problem-solving procedure' },
  { word: 'HYPOTHESIS', hint: '🔬 An educated guess in science' },
  { word: 'METAMORPHOSIS', hint: '🦋 A dramatic change in form' },
  { word: 'GRAVITATIONAL', hint: '🌍 Related to the force that pulls objects together' },
  { word: 'CHROMOSOME', hint: '🧬 Carries genetic information in cells' },
  { word: 'RENAISSANCE', hint: '🎨 A cultural rebirth in European history' },
]

function WordScrambleTeens({ theme }: { theme: string }) {
  const [idx, setIdx] = useState(0)
  const [scrambled, setScrambled] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const current = TEEN_WORDS[idx % TEEN_WORDS.length]

  useEffect(() => {
    setScrambled(shuffle(current.word.split('')).join(''))
    setInput(''); setFeedback(''); setRevealed(false)
  }, [idx])

  const check = () => {
    if (input.toUpperCase() === current.word) {
      setScore(s => s + (revealed ? 5 : 15))
      setFeedback('✅ Correct!')
      setTimeout(() => setIdx(i => i + 1), 900)
    } else {
      setFeedback('❌ Not quite, try again!')
    }
  }

  const reveal = () => { setRevealed(true); setFeedback(`💡 Hint: ${current.word.slice(0, 3)}...`) }

  const accent = theme === 'forest' ? 'from-green-500 to-teal-600' : 'from-purple-500 to-indigo-600'
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Word {(idx % TEEN_WORDS.length) + 1}/{TEEN_WORDS.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <p className="text-white/70 text-sm italic">{current.hint}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {scrambled.split('').map((l, i) => (
          <span key={i} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold shadow`}>{l}</span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && check()}
        placeholder="Unscramble the word..."
        className="w-full max-w-sm mx-auto block px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-white/30" />
      <div className="flex justify-center gap-3">
        <button onClick={check} className={`px-6 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow`}>Check</button>
        <button onClick={reveal} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white border border-white/20 text-sm">Hint (-10pts)</button>
      </div>
      {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ─── TEENS GAME 3 – Logic Puzzle ──────────────────────────────────────────────
const LOGIC_PUZZLES = [
  { q: 'I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?', answer: 'MAP', hint: 'You use me for navigation' },
  { q: 'The more you take, the more you leave behind. What am I?', answer: 'FOOTSTEPS', hint: 'Think about walking' },
  { q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', answer: 'ECHO', hint: 'Sound bouncing back' },
  { q: 'What has keys but no locks, space but no room, and you can enter but can\'t go inside?', answer: 'KEYBOARD', hint: 'You use it to type' },
  { q: 'The more you have of it, the less you see. What is it?', answer: 'DARKNESS', hint: 'Opposite of light' },
]

function LogicPuzzle({ theme }: { theme: string }) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(0)
  const [hinted, setHinted] = useState(false)

  const p = LOGIC_PUZZLES[idx % LOGIC_PUZZLES.length]

  const reset = () => { setInput(''); setFeedback(''); setHinted(false) }

  const check = () => {
    if (input.toUpperCase().includes(p.answer)) {
      setScore(s => s + (hinted ? 5 : 20))
      setFeedback('🧠 Brilliant!')
      setTimeout(() => { setIdx(i => i + 1); reset() }, 1000)
    } else {
      setFeedback('🤔 Not quite...')
    }
  }

  const hint = () => { setHinted(true); setFeedback(`💡 ${p.hint}`) }

  const accent = theme === 'forest' ? 'from-emerald-500 to-green-600' : 'from-violet-500 to-purple-600'
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Puzzle {(idx % LOGIC_PUZZLES.length) + 1}/{LOGIC_PUZZLES.length}</span>
        <span className="text-yellow-300 font-bold">🧠 {score}</span>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <p className="text-white leading-relaxed text-base italic">"{p.q}"</p>
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
        placeholder="Your answer..."
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30" />
      <div className="flex gap-3">
        <button onClick={check} className={`flex-1 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow`}>Submit</button>
        <button onClick={hint} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white border border-white/20 text-sm">Hint</button>
      </div>
      {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ─── TEENS GAME 4 – Science & General Trivia ──────────────────────────────────
const TEEN_QUIZ = [
  { q: 'What is the powerhouse of the cell?', options: ['Nucleus','Mitochondria','Ribosome','Vacuole'], answer: 'Mitochondria' },
  { q: 'What is the chemical symbol for gold?', options: ['Go','Gd','Au','Ag'], answer: 'Au' },
  { q: 'Which gas do plants absorb during photosynthesis?', options: ['Oxygen','Nitrogen','Carbon Dioxide','Hydrogen'], answer: 'Carbon Dioxide' },
  { q: 'What is the speed of light (approx)?', options: ['300,000 km/s','150,000 km/s','500,000 km/s','100,000 km/s'], answer: '300,000 km/s' },
  { q: 'Who developed the theory of general relativity?', options: ['Newton','Bohr','Einstein','Hawking'], answer: 'Einstein' },
  { q: 'What is the largest prime number below 20?', options: ['17','19','13','11'], answer: '19' },
  { q: 'DNA stands for?', options: ['Deoxyribonucleic Acid','Dinitrogen Acid','Dynamic Nucleic Array','Dense Nucleotide Acid'], answer: 'Deoxyribonucleic Acid' },
  { q: 'What is the derivative of x²?', options: ['x','2x','x²','2'], answer: '2x' },
]

function TeenTrivia({ theme }: { theme: string }) {
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const q = TEEN_QUIZ[qi]

  const pick = (opt: string) => {
    if (chosen) return
    setChosen(opt)
    if (opt === q.answer) setScore(s => s + 15)
    setTimeout(() => {
      if (qi + 1 >= TEEN_QUIZ.length) setDone(true)
      else { setQi(i => i + 1); setChosen(null) }
    }, 900)
  }

  const reset = () => { setQi(0); setScore(0); setChosen(null); setDone(false) }

  const accent = theme === 'forest' ? 'bg-green-500 hover:bg-green-600' : 'bg-indigo-500 hover:bg-indigo-600'
  if (done) return (
    <div className="text-center space-y-4">
      <p className="text-4xl">🏆</p>
      <p className="text-white text-xl font-bold">Quiz Complete!</p>
      <p className="text-yellow-300 text-lg">Score: {score} / {TEEN_QUIZ.length * 15}</p>
      <p className="text-white/60 text-sm">{score >= 90 ? 'Outstanding! 🌟' : score >= 60 ? 'Great job! 👍' : 'Keep studying! 📚'}</p>
      <button onClick={reset} className={`px-6 py-2 rounded-xl ${accent} text-white font-bold`}>Play Again</button>
    </div>
  )
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Q {qi + 1}/{TEEN_QUIZ.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <p className="text-white font-semibold text-base">{q.q}</p>
      <div className="grid grid-cols-1 gap-2">
        {q.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.97 }} onClick={() => pick(opt)}
            className={`py-3 px-4 rounded-xl text-white text-sm font-medium text-left transition-all ${
              chosen === null ? `${accent} shadow` :
              opt === q.answer ? 'bg-green-500' :
              opt === chosen ? 'bg-red-500' : 'bg-white/10 opacity-50'
            }`}>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ─── Game registry ─────────────────────────────────────────────────────────────
const KIDS_GAMES = [
  { id: 'bubble', title: 'Number Bubble Pop', emoji: '🫧', desc: 'Pop the right number bubble!', color: 'from-pink-400 to-purple-500', component: BubblePopGame },
  { id: 'memory', title: 'Memory Match', emoji: '🧠', desc: 'Find all the matching pairs', color: 'from-yellow-400 to-orange-500', component: MemoryMatchGame },
  { id: 'scramble', title: 'Word Scramble', emoji: '🔤', desc: 'Unscramble the hidden word', color: 'from-green-400 to-teal-500', component: WordScrambleKids },
  { id: 'quiz', title: 'Fun Quiz', emoji: '❓', desc: 'Test your knowledge!', color: 'from-blue-400 to-cyan-500', component: KidsQuiz },
]

const TEEN_GAMES = [
  { id: 'math', title: 'Math Speed Run', emoji: '⚡', desc: 'Solve math fast — beat the clock!', color: 'from-orange-400 to-red-500', component: MathChallenge },
  { id: 'scramble', title: 'Word Scramble', emoji: '🔤', desc: 'Unscramble complex vocabulary', color: 'from-purple-400 to-pink-500', component: WordScrambleTeens },
  { id: 'logic', title: 'Logic Riddles', emoji: '🧩', desc: 'Crack the brain teasers', color: 'from-indigo-400 to-violet-500', component: LogicPuzzle },
  { id: 'trivia', title: 'Science Trivia', emoji: '🔬', desc: 'STEM knowledge challenge', color: 'from-cyan-400 to-blue-500', component: TeenTrivia },
]

// ─── Main GamesSection component ──────────────────────────────────────────────
export default function GamesSection({ theme, ageGroup }: GamesSectionProps) {
  const [activeGame, setActiveGame] = useState<string | null>(null)
  const games = ageGroup === 'kids' ? KIDS_GAMES : TEEN_GAMES

  const tc = {
    container: theme === 'forest' ? 'bg-green-500/10 border-green-500/20' : 'bg-blue-500/10 border-blue-500/20',
    card: theme === 'forest' ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/15' : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/15',
  }

  const current = games.find(g => g.id === activeGame)
  const GameComponent = current?.component

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {ageGroup === 'kids' ? '🎮 Forest Games' : '🚀 Space Games'}
        </h2>
        <p className="text-white/70">
          {ageGroup === 'kids' ? 'Play, learn and have fun!' : 'Challenge your brain with these games!'}
        </p>
      </motion.div>

      {/* Game grid */}
      {!activeGame && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {games.map((game, i) => (
            <motion.div key={game.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveGame(game.id)}
              className={`rounded-2xl border backdrop-blur-sm ${tc.card} p-6 cursor-pointer transition-all`}>
              <div className="flex items-center space-x-4 mb-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {game.emoji}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{game.title}</h3>
                  <p className="text-white/60 text-sm">{game.desc}</p>
                </div>
              </div>
              <div className="flex items-center text-white/50 text-sm mt-2">
                <span>Tap to play →</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Active game */}
      <AnimatePresence>
        {activeGame && current && GameComponent && (
          <motion.div key={activeGame}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-4 sm:p-6`}>
            {/* Game header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center text-xl`}>
                  {current.emoji}
                </div>
                <h3 className="text-lg font-bold text-white">{current.title}</h3>
              </div>
              <button onClick={() => setActiveGame(null)}
                className="flex items-center gap-1 text-white/60 hover:text-white text-sm px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                <RotateCcw className="w-3 h-3" /> All Games
              </button>
            </div>
            {/* Render game */}
            <GameComponent theme={theme} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
