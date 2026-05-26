import { NextRequest, NextResponse } from 'next/server'

const TOGETHER_KEY = process.env.TOGETHER_API_KEY ?? 'ab85f36a6259ab35ff4f2433e1b252e893e4a4ea4577580b60e82b47d1be5abc'
const REPLICATE_KEY = process.env.REPLICATE_API_KEY ?? ''

// Together AI's /v1/videos endpoint requires a dedicated container (paid plan).
// We fall back to Replicate's free-tier Wan 2.1 model instead.
// Set REPLICATE_API_KEY in .env.local to enable video generation.
// Get a free key at: https://replicate.com

async function createReplicateVideo(prompt: string, imageUrl?: string): Promise<string> {
  if (!REPLICATE_KEY) {
    throw new Error('REPLICATE_API_KEY not set — add it to .env.local to enable video generation')
  }

  const model = imageUrl
    ? 'wavespeedai/wan-2.1-i2v-480p'   // image-to-video
    : 'wavespeedai/wan-2.1-t2v-480p'   // text-to-video

  const input: Record<string, unknown> = { prompt, num_frames: 81 }
  if (imageUrl) input.image = imageUrl

  const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REPLICATE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=30',
    },
    body: JSON.stringify({ input }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`Replicate error ${res.status}: ${data?.detail ?? res.statusText}`)
  if (!data.id) throw new Error(`No prediction ID: ${JSON.stringify(data)}`)
  return data.id
}

async function pollReplicateVideo(predictionId: string): Promise<{ status: string; videoUrl: string | null; error: string | null }> {
  if (!REPLICATE_KEY) throw new Error('REPLICATE_API_KEY not set')

  const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
    headers: { Authorization: `Bearer ${REPLICATE_KEY}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Replicate poll error ${res.status}: ${data?.detail ?? res.statusText}`)

  const status = data.status // "starting" | "processing" | "succeeded" | "failed" | "canceled"
  const videoUrl = Array.isArray(data.output) ? data.output[0] : (data.output ?? null)
  const error = data.error ?? null

  const mapped = status === 'succeeded' ? 'completed' : status === 'failed' || status === 'canceled' ? 'failed' : 'in_progress'
  return { status: mapped, videoUrl, error }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action = 'create' } = body

    if (action === 'poll') {
      const { jobId } = body
      if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })
      const result = await pollReplicateVideo(jobId)
      return NextResponse.json(result)
    }

    const { prompt, imageUrl, ageGroup = 'kids' } = body
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '"prompt" is required' }, { status: 400 })
    }

    const safePrompt = ageGroup === 'kids'
      ? `Colorful, friendly, cartoon-style educational video: ${prompt}. Safe for children, vibrant colors, clear motion.`
      : `Cinematic, photorealistic educational video: ${prompt}. High quality, natural motion, informative.`

    const jobId = await createReplicateVideo(safePrompt, imageUrl)
    return NextResponse.json({ jobId, status: 'in_progress' })

  } catch (error) {
    console.error('[video] error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
