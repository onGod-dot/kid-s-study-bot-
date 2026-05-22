'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Trophy, Star, ChevronRight, Sparkles, Award, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { TogetherAIService } from '@/lib/together-ai'
import Confetti from '@/components/Confetti'

interface GamesSectionProps {
  theme: 'forest' | 'space'
  ageGroup: 'kids' | 'teens'
}

// ── onComplete callback type ──────────────────────────────────────────────────
type GameProps = { theme: string; onComplete: (score: number) => void }

// ── Shared helpers ────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5) }

// ── KIDS GAME 1 – Number Bubble Pop ──────────────────────────────────────────
function BubblePopGame({ theme, onComplete }: GameProps) {
  const [target, setTarget] = useState(0)
  const [bubbles, setBubbles] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [round, setRound] = useState(1)
  const [done, setDone] = useState(false)
  const MAX_ROUNDS = 8

  const newRound = useCallback(() => {
    const t = Math.floor(Math.random() * 10) + 1
    const wrong = Array.from({ length: 5 }, () => {
      let n: number; do { n = Math.floor(Math.random() * 15) + 1 } while (n === t); return n
    })
    setBubbles(shuffle([t, ...wrong])); setTarget(t); setFeedback('')
  }, [])

  useEffect(() => { newRound() }, [newRound])

  const pop = (n: number) => {
    if (done) return
    if (n === target) {
      const ns = score + 10; setScore(ns); setFeedback('🎉 Correct!')
      if (round >= MAX_ROUNDS) { setDone(true); setTimeout(() => onComplete(ns), 900) }
      else { setRound(r => r + 1); setTimeout(newRound, 800) }
    } else { setFeedback('❌ Try again!') }
  }

  const accent = theme === 'forest' ? 'text-green-300' : 'text-blue-300'
  return (
    <div className="text-center space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Round {round}/{MAX_ROUNDS}</span>
        <span className={`font-bold text-lg ${accent}`}>⭐ {score}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${(round / MAX_ROUNDS) * 100}%` }} />
      </div>
      <p className="text-white text-xl font-bold">Pop the bubble showing <span className={accent}>{target}</span></p>
      <div className="flex flex-wrap justify-center gap-3">
        {bubbles.map((n, i) => (
          <motion.button key={i} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }}
            onClick={() => pop(n)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white text-xl font-bold shadow-lg">
            {n}
          </motion.button>
        ))}
      </div>
      {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white text-lg font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ── KIDS GAME 2 – Memory Match ────────────────────────────────────────────────
const EMOJIS = ['🐶','🐱','🐸','🦊','🐻','🦁','🐼','🐨']
function MemoryMatchGame({ theme, onComplete }: GameProps) {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  const init = useCallback(() => {
    const deck = shuffle([...EMOJIS, ...EMOJIS]).map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }))
    setCards(deck); setSelected([]); setMoves(0); setWon(false)
  }, [])
  useEffect(() => { init() }, [init])

  const flip = (id: number) => {
    if (selected.length === 2 || won) return
    const card = cards[id]; if (card.flipped || card.matched) return
    const next = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
    const newSel = [...selected, id]; setCards(next); setSelected(newSel)
    if (newSel.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = newSel
      if (next[a].emoji === next[b].emoji) {
        const matched = next.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c)
        setCards(matched); setSelected([])
        if (matched.every(c => c.matched)) {
          setWon(true)
          const sc = Math.max(10, 200 - moves * 5)
          setTimeout(() => onComplete(sc), 900)
        }
      } else {
        setTimeout(() => { setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, flipped: false } : c)); setSelected([]) }, 900)
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
      {won && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`text-center text-xl font-bold ${accent}`}>🎉 Matched all in {moves} moves!</motion.div>}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map(card => (
          <motion.button key={card.id} whileTap={{ scale: 0.9 }} onClick={() => flip(card.id)}
            className={`h-12 sm:h-14 rounded-xl text-xl sm:text-2xl font-bold transition-all duration-300 ${card.flipped || card.matched ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' : 'bg-white/10 border border-white/20 hover:bg-white/20'} ${card.matched ? 'opacity-50' : ''}`}>
            {card.flipped || card.matched ? card.emoji : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── KIDS GAME 3 – Word Scramble ───────────────────────────────────────────────
const KIDS_WORDS = [
  { word: 'CAT', hint: '🐱 A furry pet that meows' }, { word: 'DOG', hint: '🐶 A loyal pet that barks' },
  { word: 'SUN', hint: '☀️ It shines in the sky' }, { word: 'TREE', hint: '🌳 It has leaves and branches' },
  { word: 'FISH', hint: '🐟 It swims in water' }, { word: 'BIRD', hint: '🐦 It has wings and can fly' },
  { word: 'STAR', hint: '⭐ It twinkles at night' }, { word: 'FROG', hint: '🐸 It jumps and says ribbit' },
]
function WordScrambleKids({ theme, onComplete }: GameProps) {
  const [idx, setIdx] = useState(0); const [scrambled, setScrambled] = useState(''); const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(''); const [score, setScore] = useState(0)
  const current = KIDS_WORDS[idx % KIDS_WORDS.length]
  useEffect(() => { setScrambled(shuffle(current.word.split('')).join('')); setInput(''); setFeedback('') }, [idx])
  const check = () => {
    if (input.toUpperCase() === current.word) {
      const ns = score + 10; setScore(ns); setFeedback('🎉 Correct!')
      if (idx + 1 >= KIDS_WORDS.length) { setTimeout(() => onComplete(ns), 900) }
      else { setTimeout(() => setIdx(i => i + 1), 900) }
    } else { setFeedback('❌ Try again!') }
  }
  const accent = theme === 'forest' ? 'from-green-400 to-emerald-500' : 'from-blue-400 to-cyan-500'
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Word {(idx % KIDS_WORDS.length) + 1}/{KIDS_WORDS.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${((idx % KIDS_WORDS.length) / KIDS_WORDS.length) * 100}%` }} />
      </div>
      <p className="text-white/70 text-sm">{current.hint}</p>
      <div className="flex justify-center gap-2 flex-wrap">
        {scrambled.split('').map((l, i) => (
          <span key={i} className={`w-9 h-9 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold shadow`}>{l}</span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && check()}
        placeholder="Type the word..." className="w-full max-w-xs mx-auto block px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-white/30" />
      <button onClick={check} className={`px-6 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow hover:opacity-90 transition`}>Check</button>
      {feedback && <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ── KIDS GAME 4 – Fun Quiz ────────────────────────────────────────────────────
const KIDS_QUIZ = [
  { q: 'How many legs does a spider have?', options: ['4','6','8','10'], answer: '8' },
  { q: 'What color do you get mixing red and blue?', options: ['Green','Purple','Orange','Pink'], answer: 'Purple' },
  { q: 'Which planet is closest to the Sun?', options: ['Earth','Venus','Mercury','Mars'], answer: 'Mercury' },
  { q: 'How many sides does a triangle have?', options: ['2','3','4','5'], answer: '3' },
  { q: 'What do caterpillars turn into?', options: ['Bees','Butterflies','Moths','Dragonflies'], answer: 'Butterflies' },
  { q: 'Which is the largest ocean?', options: ['Atlantic','Indian','Arctic','Pacific'], answer: 'Pacific' },
]
function KidsQuiz({ theme, onComplete }: GameProps) {
  const [qi, setQi] = useState(0); const [score, setScore] = useState(0); const [chosen, setChosen] = useState<string | null>(null)
  const q = KIDS_QUIZ[qi]
  const pick = (opt: string) => {
    if (chosen) return; setChosen(opt)
    const ns = opt === q.answer ? score + 10 : score; if (opt === q.answer) setScore(ns)
    setTimeout(() => {
      if (qi + 1 >= KIDS_QUIZ.length) { onComplete(ns) }
      else { setQi(i => i + 1); setChosen(null) }
    }, 900)
  }
  const accent = theme === 'forest' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Q {qi + 1}/{KIDS_QUIZ.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${(qi / KIDS_QUIZ.length) * 100}%` }} />
      </div>
      <p className="text-white font-semibold text-lg">{q.q}</p>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map(opt => (
          <motion.button key={opt} whileTap={{ scale: 0.95 }} onClick={() => pick(opt)}
            className={`py-3 px-4 rounded-xl text-white font-medium transition-all ${chosen === null ? `${accent} shadow` : opt === q.answer ? 'bg-green-500' : opt === chosen ? 'bg-red-500' : 'bg-white/10 opacity-50'}`}>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── TEENS GAME 1 – Math Speed Challenge ──────────────────────────────────────
function MathChallenge({ theme, onComplete }: GameProps) {
  const [score, setScore] = useState(0); const [streak, setStreak] = useState(0)
  const [input, setInput] = useState(''); const [feedback, setFeedback] = useState('')
  const [q, setQ] = useState({ text: '', answer: 0 }); const [timeLeft, setTimeLeft] = useState(30); const [active, setActive] = useState(false)
  const completed = useRef(false)

  const genQ = useCallback(() => {
    const ops = ['+','-','×','÷']; const op = ops[Math.floor(Math.random()*ops.length)]
    let a:number,b:number,answer:number,text:string
    if(op==='+'){a=Math.floor(Math.random()*50)+1;b=Math.floor(Math.random()*50)+1;answer=a+b;text=`${a} + ${b}`}
    else if(op==='-'){a=Math.floor(Math.random()*50)+20;b=Math.floor(Math.random()*20)+1;answer=a-b;text=`${a} - ${b}`}
    else if(op==='×'){a=Math.floor(Math.random()*12)+1;b=Math.floor(Math.random()*12)+1;answer=a*b;text=`${a} × ${b}`}
    else{b=Math.floor(Math.random()*11)+2;answer=Math.floor(Math.random()*10)+1;a=b*answer;text=`${a} ÷ ${b}`}
    setQ({text,answer}); setInput(''); setFeedback('')
  }, [])

  const start = () => { completed.current=false; setScore(0); setStreak(0); setTimeLeft(30); setActive(true); genQ() }

  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setTimeLeft(s => {
      if (s <= 1) { clearInterval(t); setActive(false); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(t)
  }, [active])

  useEffect(() => {
    if (!active && timeLeft === 0 && !completed.current) {
      completed.current = true; onComplete(score)
    }
  }, [active, timeLeft]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    if (!active) return
    const val = parseInt(input)
    if (val === q.answer) {
      const bonus = streak >= 3 ? 20 : 10; const ns = score + bonus
      setScore(ns); setStreak(s=>s+1); setFeedback(streak>=2?'🔥 On fire!':'✅ Correct!')
    } else { setStreak(0); setFeedback(`❌ Answer: ${q.answer}`) }
    setTimeout(genQ, 600)
  }

  const accent = theme==='forest'?'from-green-500 to-emerald-600':'from-blue-500 to-indigo-600'
  const barColor = timeLeft>15?'bg-green-400':timeLeft>8?'bg-yellow-400':'bg-red-400'

  if (!active && score===0 && timeLeft===30) return (
    <div className="text-center space-y-4">
      <p className="text-white text-lg">Solve as many math problems as you can in 30 seconds!</p>
      <p className="text-white/60 text-sm">Streaks give bonus points 🔥</p>
      <button onClick={start} className={`px-8 py-3 rounded-xl bg-gradient-to-r ${accent} text-white font-bold text-lg shadow-lg`}>Start!</button>
    </div>
  )
  if (!active) return (
    <div className="text-center space-y-4">
      <p className="text-4xl">🏆</p><p className="text-white text-xl font-bold">Time's up!</p>
      <p className="text-yellow-300 text-2xl font-bold">{score} points</p>
      <button onClick={start} className={`px-6 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold`}>Play Again</button>
    </div>
  )
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-yellow-300 font-bold text-lg">⭐ {score}</span>
        {streak>=2&&<span className="text-orange-400 font-bold">🔥 {streak} streak</span>}
        <span className={`font-bold ${timeLeft<=8?'text-red-400 animate-pulse':'text-white'}`}>{timeLeft}s</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2"><div className={`${barColor} h-2 rounded-full transition-all`} style={{width:`${(timeLeft/30)*100}%`}}/></div>
      <p className="text-white text-3xl font-bold text-center py-4">{q.text} = ?</p>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()}
        type="number" placeholder="Your answer..." autoFocus
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-white/30"/>
      <button onClick={submit} className={`w-full py-3 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow`}>Submit</button>
      {feedback&&<motion.p initial={{scale:0}} animate={{scale:1}} className="text-center text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ── TEENS GAME 2 – Word Scramble ─────────────────────────────────────────────
const TEEN_WORDS = [
  { word:'PHOTOSYNTHESIS', hint:'🌿 How plants make food from sunlight' },
  { word:'DEMOCRACY', hint:'🗳️ A system of government by the people' },
  { word:'ALGORITHM', hint:'💻 A step-by-step problem-solving procedure' },
  { word:'HYPOTHESIS', hint:'🔬 An educated guess in science' },
  { word:'METAMORPHOSIS', hint:'🦋 A dramatic change in form' },
  { word:'CHROMOSOME', hint:'🧬 Carries genetic information in cells' },
]
function WordScrambleTeens({ theme, onComplete }: GameProps) {
  const [idx,setIdx]=useState(0); const [scrambled,setScrambled]=useState(''); const [input,setInput]=useState('')
  const [feedback,setFeedback]=useState(''); const [score,setScore]=useState(0); const [revealed,setRevealed]=useState(false)
  const current=TEEN_WORDS[idx%TEEN_WORDS.length]
  useEffect(()=>{setScrambled(shuffle(current.word.split('')).join(''));setInput('');setFeedback('');setRevealed(false)},[idx])
  const check=()=>{
    if(input.toUpperCase()===current.word){
      const ns=score+(revealed?5:15); setScore(ns); setFeedback('✅ Correct!')
      if(idx+1>=TEEN_WORDS.length){setTimeout(()=>onComplete(ns),900)}
      else{setTimeout(()=>setIdx(i=>i+1),900)}
    } else{setFeedback('❌ Not quite!')}
  }
  const accent=theme==='forest'?'from-green-500 to-teal-600':'from-purple-500 to-indigo-600'
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Word {(idx%TEEN_WORDS.length)+1}/{TEEN_WORDS.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{width:`${((idx%TEEN_WORDS.length)/TEEN_WORDS.length)*100}%`}}/>
      </div>
      <p className="text-white/70 text-sm italic">{current.hint}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {scrambled.split('').map((l,i)=>(
          <span key={i} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white font-bold shadow`}>{l}</span>
        ))}
      </div>
      <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&check()}
        placeholder="Unscramble the word..."
        className="w-full max-w-sm mx-auto block px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-white/30"/>
      <div className="flex justify-center gap-3">
        <button onClick={check} className={`px-6 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow`}>Check</button>
        <button onClick={()=>{setRevealed(true);setFeedback(`💡 Hint: ${current.word.slice(0,3)}...`)}} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white border border-white/20 text-sm">Hint</button>
      </div>
      {feedback&&<motion.p initial={{scale:0}} animate={{scale:1}} className="text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ── TEENS GAME 3 – Logic Puzzle ───────────────────────────────────────────────
const LOGIC_PUZZLES = [
  { q:'I have cities, but no houses. Mountains, but no trees. Water, but no fish. What am I?', answer:'MAP', hint:'Used for navigation' },
  { q:'The more you take, the more you leave behind. What am I?', answer:'FOOTSTEPS', hint:'Think about walking' },
  { q:'I speak without a mouth, hear without ears. I come alive with wind. What am I?', answer:'ECHO', hint:'Sound bouncing back' },
  { q:'What has keys but no locks, space but no room, and you can enter but not go inside?', answer:'KEYBOARD', hint:'You type on it' },
  { q:'The more you have of it, the less you see. What is it?', answer:'DARKNESS', hint:'Opposite of light' },
]
function LogicPuzzle({ theme, onComplete }: GameProps) {
  const [idx,setIdx]=useState(0); const [input,setInput]=useState(''); const [feedback,setFeedback]=useState('')
  const [score,setScore]=useState(0); const [hinted,setHinted]=useState(false)
  const p=LOGIC_PUZZLES[idx%LOGIC_PUZZLES.length]
  const reset=()=>{setInput('');setFeedback('');setHinted(false)}
  const check=()=>{
    if(input.toUpperCase().includes(p.answer)){
      const ns=score+(hinted?5:20); setScore(ns); setFeedback('🧠 Brilliant!')
      if(idx+1>=LOGIC_PUZZLES.length){setTimeout(()=>onComplete(ns),1000)}
      else{setTimeout(()=>{setIdx(i=>i+1);reset()},1000)}
    } else{setFeedback('🤔 Not quite...')}
  }
  const accent=theme==='forest'?'from-emerald-500 to-green-600':'from-violet-500 to-purple-600'
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Puzzle {(idx%LOGIC_PUZZLES.length)+1}/{LOGIC_PUZZLES.length}</span>
        <span className="text-yellow-300 font-bold">🧠 {score}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{width:`${((idx%LOGIC_PUZZLES.length)/LOGIC_PUZZLES.length)*100}%`}}/>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <p className="text-white leading-relaxed text-base italic">"{p.q}"</p>
      </div>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&check()}
        placeholder="Your answer..." className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/30"/>
      <div className="flex gap-3">
        <button onClick={check} className={`flex-1 py-2 rounded-xl bg-gradient-to-r ${accent} text-white font-bold shadow`}>Submit</button>
        <button onClick={()=>{setHinted(true);setFeedback(`💡 ${p.hint}`)}} className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white border border-white/20 text-sm">Hint</button>
      </div>
      {feedback&&<motion.p initial={{scale:0}} animate={{scale:1}} className="text-center text-white font-semibold">{feedback}</motion.p>}
    </div>
  )
}

// ── TEENS GAME 4 – Science Trivia ────────────────────────────────────────────
const TEEN_QUIZ = [
  { q:'What is the powerhouse of the cell?', options:['Nucleus','Mitochondria','Ribosome','Vacuole'], answer:'Mitochondria' },
  { q:'Chemical symbol for gold?', options:['Go','Gd','Au','Ag'], answer:'Au' },
  { q:'Gas plants absorb during photosynthesis?', options:['Oxygen','Nitrogen','Carbon Dioxide','Hydrogen'], answer:'Carbon Dioxide' },
  { q:'Speed of light (approx)?', options:['300,000 km/s','150,000 km/s','500,000 km/s','100,000 km/s'], answer:'300,000 km/s' },
  { q:'Who developed general relativity?', options:['Newton','Bohr','Einstein','Hawking'], answer:'Einstein' },
  { q:'Largest prime below 20?', options:['17','19','13','11'], answer:'19' },
  { q:'DNA stands for?', options:['Deoxyribonucleic Acid','Dinitrogen Acid','Dynamic Nucleic Array','Dense Nucleotide Acid'], answer:'Deoxyribonucleic Acid' },
  { q:'Derivative of x²?', options:['x','2x','x²','2'], answer:'2x' },
]
function TeenTrivia({ theme, onComplete }: GameProps) {
  const [qi,setQi]=useState(0); const [score,setScore]=useState(0); const [chosen,setChosen]=useState<string|null>(null)
  const q=TEEN_QUIZ[qi]
  const pick=(opt:string)=>{
    if(chosen)return; setChosen(opt)
    const ns=opt===q.answer?score+15:score; if(opt===q.answer)setScore(ns)
    setTimeout(()=>{
      if(qi+1>=TEEN_QUIZ.length){onComplete(ns)}
      else{setQi(i=>i+1);setChosen(null)}
    },900)
  }
  const accent=theme==='forest'?'bg-green-500 hover:bg-green-600':'bg-indigo-500 hover:bg-indigo-600'
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-sm">Q {qi+1}/{TEEN_QUIZ.length}</span>
        <span className="text-yellow-300 font-bold">⭐ {score}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{width:`${(qi/TEEN_QUIZ.length)*100}%`}}/>
      </div>
      <p className="text-white font-semibold text-base">{q.q}</p>
      <div className="grid grid-cols-1 gap-2">
        {q.options.map(opt=>(
          <motion.button key={opt} whileTap={{scale:0.97}} onClick={()=>pick(opt)}
            className={`py-3 px-4 rounded-xl text-white text-sm font-medium text-left transition-all ${chosen===null?`${accent} shadow`:opt===q.answer?'bg-green-500':opt===chosen?'bg-red-500':'bg-white/10 opacity-50'}`}>
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ── Game registry ─────────────────────────────────────────────────────────────
const KIDS_GAMES = [
  { id:'bubble',   title:'Number Bubble Pop', emoji:'🫧', desc:'Pop the right number!',        color:'from-pink-400 to-purple-500',   component:BubblePopGame },
  { id:'memory',   title:'Memory Match',      emoji:'🧠', desc:'Find all matching pairs',      color:'from-yellow-400 to-orange-500', component:MemoryMatchGame },
  { id:'scramble', title:'Word Scramble',     emoji:'🔤', desc:'Unscramble the hidden word',   color:'from-green-400 to-teal-500',    component:WordScrambleKids },
  { id:'quiz',     title:'Fun Quiz',          emoji:'❓', desc:'Test your knowledge!',          color:'from-blue-400 to-cyan-500',     component:KidsQuiz },
]
const TEEN_GAMES = [
  { id:'math',     title:'Math Speed Run',    emoji:'⚡', desc:'Beat the clock!',              color:'from-orange-400 to-red-500',    component:MathChallenge },
  { id:'scramble', title:'Word Scramble',     emoji:'🔤', desc:'Unscramble complex vocab',     color:'from-purple-400 to-pink-500',   component:WordScrambleTeens },
  { id:'logic',    title:'Logic Riddles',     emoji:'🧩', desc:'Crack the brain teasers',      color:'from-indigo-400 to-violet-500', component:LogicPuzzle },
  { id:'trivia',   title:'Science Trivia',    emoji:'🔬', desc:'STEM knowledge challenge',     color:'from-cyan-400 to-blue-500',     component:TeenTrivia },
]

// Badge definitions per game
const BADGE_META: Record<string, { emoji: string; label: string }> = {
  bubble:  { emoji:'🫧', label:'Bubble Master' },
  memory:  { emoji:'🧠', label:'Memory Champ' },
  scramble:{ emoji:'🔤', label:'Word Wizard' },
  quiz:    { emoji:'❓', label:'Quiz Whiz' },
  math:    { emoji:'⚡', label:'Math Speedster' },
  logic:   { emoji:'🧩', label:'Logic Legend' },
  trivia:  { emoji:'🔬', label:'Science Star' },
}

// ── Main GamesSection ─────────────────────────────────────────────────────────
export default function GamesSection({ theme, ageGroup }: GamesSectionProps) {
  const games = ageGroup === 'kids' ? KIDS_GAMES : TEEN_GAMES
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [showBadge, setShowBadge] = useState<{ emoji: string; label: string; score: number } | null>(null)
  const [aiMsg, setAiMsg] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const { badges, addBadge } = useAppStore()

  const sessionBadges = badges.filter(b => b.ageGroup === ageGroup)

  const tc = {
    container: theme==='forest'?'bg-green-500/10 border-green-500/20':'bg-blue-500/10 border-blue-500/20',
    card: theme==='forest'?'bg-green-500/5 border-green-500/20 hover:bg-green-500/15':'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/15',
    btn: theme==='forest'?'bg-green-500 hover:bg-green-600':'bg-blue-500 hover:bg-blue-600',
  }

  const handleGameComplete = async (score: number) => {
    if (activeIdx === null) return
    const game = games[activeIdx]
    const meta = BADGE_META[game.id] ?? { emoji:'🏅', label:'Game Complete' }

    // Award badge
    addBadge({ gameId: game.id, gameTitle: game.title, emoji: meta.emoji, score, ageGroup })
    setShowBadge({ emoji: meta.emoji, label: meta.label, score })
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 2500)

    // AI encouragement
    setAiLoading(true)
    setAiMsg('')
    try {
      const prompt = ageGroup === 'kids'
        ? `A child just completed the "${game.title}" game and scored ${score} points. Write ONE short (max 2 sentences), super encouraging, fun message for them. Use 1-2 emojis. Be warm and playful.`
        : `A teenager just completed the "${game.title}" game and scored ${score} points. Write ONE short (max 2 sentences) motivating message. Be direct and cool, use 1 emoji.`
      const msg = await TogetherAIService.chatCompletion([
        { role: 'system', content: 'You are a friendly game coach. Reply with ONLY the encouragement message, nothing else.' },
        { role: 'user', content: prompt },
      ])
      setAiMsg(msg.trim())
    } catch { setAiMsg(ageGroup==='kids'?'Amazing job! You\'re a superstar! 🌟':'Great work! Keep pushing! 💪') }
    finally { setAiLoading(false) }
  }

  const goNext = () => {
    setShowBadge(null); setAiMsg('')
    if (activeIdx === null) return
    const next = (activeIdx + 1) % games.length
    setActiveIdx(next)
  }

  const backToGrid = () => { setActiveIdx(null); setShowBadge(null); setAiMsg('') }

  const current = activeIdx !== null ? games[activeIdx] : null
  const GameComponent = current?.component

  return (
    <div className="space-y-5">
      <Confetti active={showConfetti} />

      {/* ── Badge shelf ── */}
      {sessionBadges.length > 0 && (
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}}
          className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold text-sm">Your Badges</span>
            <span className="ml-auto text-white/40 text-xs">{sessionBadges.length} earned</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sessionBadges.map(b => (
              <motion.div key={b.id} initial={{scale:0}} animate={{scale:1}}
                className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
                <span className="text-base">{b.emoji}</span>
                <div>
                  <p className="text-white text-xs font-semibold leading-none">{BADGE_META[b.gameId]?.label ?? b.gameTitle}</p>
                  <p className="text-white/40 text-[10px]">⭐ {b.score}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Header ── */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {ageGroup==='kids'?'🎮 Forest Games':'🚀 Space Games'}
        </h2>
        <p className="text-white/60 text-sm">
          {ageGroup==='kids'?'Play all 4 games and collect every badge!':'Complete all challenges and earn your badges!'}
        </p>
      </motion.div>

      {/* ── Game grid ── */}
      {activeIdx === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {games.map((game, i) => {
            const earned = sessionBadges.some(b => b.gameId === game.id)
            return (
              <motion.div key={game.id}
                initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                whileHover={{scale:1.03,y:-4}} whileTap={{scale:0.97}}
                onClick={() => setActiveIdx(i)}
                className={`rounded-2xl border backdrop-blur-sm ${tc.card} p-5 cursor-pointer transition-all relative overflow-hidden`}>
                {earned && (
                  <div className="absolute top-2 right-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-300 text-[10px] font-bold">Done</span>
                  </div>
                )}
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {game.emoji}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{game.title}</h3>
                    <p className="text-white/50 text-xs">{game.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-white/40 text-xs">
                  <span>{earned ? `${BADGE_META[game.id]?.emoji} Badge earned` : 'Tap to play'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Active game ── */}
      <AnimatePresence mode="wait">
        {activeIdx !== null && current && GameComponent && !showBadge && (
          <motion.div key={`game-${activeIdx}`}
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
            className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-4 sm:p-6`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${current.color} flex items-center justify-center text-lg`}>
                  {current.emoji}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{current.title}</h3>
                  <p className="text-white/40 text-xs">{activeIdx+1} of {games.length}</p>
                </div>
              </div>
              <button onClick={backToGrid}
                className="flex items-center gap-1 text-white/50 hover:text-white text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
                <RotateCcw className="w-3 h-3" /> All Games
              </button>
            </div>
            <GameComponent theme={theme} onComplete={handleGameComplete} />
          </motion.div>
        )}

        {/* ── Badge award screen ── */}
        {showBadge && (
          <motion.div key="badge"
            initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.85}}
            className={`rounded-2xl border backdrop-blur-sm ${tc.container} p-6 text-center space-y-5`}>
            <motion.div animate={{rotate:[0,-10,10,-10,0],scale:[1,1.2,1]}} transition={{duration:0.6}}
              className="text-7xl mx-auto">{showBadge.emoji}</motion.div>
            <div>
              <p className="text-white/60 text-sm uppercase tracking-widest font-semibold mb-1">Badge Unlocked</p>
              <h3 className="text-2xl font-black text-white">{showBadge.label}</h3>
              <p className="text-yellow-300 font-bold mt-1">⭐ {showBadge.score} points</p>
            </div>

            {/* AI message */}
            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-h-[52px] flex items-center justify-center">
              {aiLoading
                ? <div className="flex items-center gap-2 text-white/50 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Thinking...</div>
                : <p className="text-white/90 text-sm leading-relaxed">{aiMsg}</p>
              }
            </div>

            <div className="flex gap-3">
              <button onClick={backToGrid}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all border border-white/10">
                All Games
              </button>
              <button onClick={goNext}
                className={`flex-1 py-2.5 rounded-xl ${tc.btn} text-white text-sm font-bold transition-all flex items-center justify-center gap-2`}>
                Next Game <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
