import { useCallback, useRef } from 'react'

export const useSoundEffects = (enabled: boolean) => {
  // Reuse a single AudioContext — creating one per call leaks memory
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = (): AudioContext | null => {
    if (!enabled) return null
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return ctxRef.current
  }

  const playTone = useCallback((
    startFreq: number,
    endFreq: number,
    duration: number,
    gain: number
  ) => {
    const ctx = getCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration)
    gainNode.gain.setValueAtTime(gain, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  const playClickSound = useCallback(() => {
    playTone(800, 400, 0.1, 0.3)
  }, [playTone])

  const playHoverSound = useCallback(() => {
    playTone(600, 800, 0.05, 0.1)
  }, [playTone])

  const playSuccessSound = useCallback(() => {
    const ctx = getCtx()
    if (!ctx) return
    // Play a C-E-G arpeggio
    ;[[523.25, 0], [659.25, 0.1], [783.99, 0.2]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.connect(g)
      g.connect(ctx.destination)
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
      g.gain.setValueAtTime(0.2, ctx.currentTime + delay)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.15)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.15)
    })
  }, [enabled]) // eslint-disable-line react-hooks/exhaustive-deps

  return { playClickSound, playHoverSound, playSuccessSound }
}
