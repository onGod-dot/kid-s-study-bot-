import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.TOGETHER_API_KEY ?? 'ab85f36a6259ab35ff4f2433e1b252e893e4a4ea4577580b60e82b47d1be5abc'
const BASE = 'https://api.together.xyz/v1'

// ── helpers ───────────────────────────────────────────────────────────────────
async function togetherFetch(path: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Together API ${res.status}: ${err?.error?.message ?? res.statusText}`)
  }
  return res.json()
}

// ── POST /api/generate-video ──────────────────────────────────────────────────
// Body: { prompt, imageUrl?, ageGroup?, action }
// action: "create" | "poll"
// For "poll": { jobId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action = 'create' } = body

    // ── Poll existing job ─────────────────────────────────────────────────────
    if (action === 'poll') {
      const { jobId } = body
      if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })
      const status = await togetherFetch(`/videos/${jobId}`)
      return NextResponse.json({
        status: status.status,                          // "in_progress" | "completed" | "failed"
        videoUrl: status.outputs?.video_url ?? null,
        error: status.error?.message ?? null,
      })
    }

    // ── Create new job ────────────────────────────────────────────────────────
    const { prompt, imageUrl, ageGroup = 'kids' } = body
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '"prompt" is required' }, { status: 400 })
    }

    const isI2V = !!imageUrl  // image-to-video when an image is attached

    // Age-appropriate prompt prefix
    const safePrompt = ageGroup === 'kids'
      ? `Colorful, friendly, cartoon-style educational video: ${prompt}. Safe for children, vibrant colors, clear motion.`
      : `Cinematic, photorealistic educational video: ${prompt}. High quality, natural motion, informative.`

    const negativePrompt = 'low resolution, blurry, distorted, incomplete, bad quality, watermark, text overlay'

    const jobBody: Record<string, unknown> = {
      model: isI2V ? 'Wan-AI/wan2.7-i2v' : 'Wan-AI/wan2.7-t2v',
      prompt: safePrompt,
      negative_prompt: negativePrompt,
      resolution: '720P',
      ratio: '16:9',
      seconds: '5',
    }

    if (isI2V) {
      jobBody.media = {
        frame_images: [{ input_image: imageUrl, frame: 'first' }],
      }
    }

    const job = await togetherFetch('/videos', jobBody)
    return NextResponse.json({ jobId: job.id, status: 'in_progress' })

  } catch (error) {
    console.error('Video generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
