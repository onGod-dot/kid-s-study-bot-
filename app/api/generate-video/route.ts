import { NextRequest, NextResponse } from 'next/server'
import Together from 'together-ai'

const API_KEY = process.env.TOGETHER_API_KEY ?? 'ab85f36a6259ab35ff4f2433e1b252e893e4a4ea4577580b60e82b47d1be5abc'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action = 'create' } = body

    const client = new Together({ apiKey: API_KEY })

    // ── Poll existing job ─────────────────────────────────────────────────────
    if (action === 'poll') {
      const { jobId } = body
      if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

      const data = await (client.videos as any).retrieve(jobId)
      console.log('[video] poll:', JSON.stringify(data))

      return NextResponse.json({
        status: data.status ?? 'in_progress',
        videoUrl: data.outputs?.video_url ?? null,
        error: data.error?.message ?? null,
      })
    }

    // ── Create new job ────────────────────────────────────────────────────────
    const { prompt, imageUrl, ageGroup = 'kids' } = body
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: '"prompt" is required' }, { status: 400 })
    }

    const isI2V = !!imageUrl

    const safePrompt = ageGroup === 'kids'
      ? `Colorful, friendly, cartoon-style educational video: ${prompt}. Safe for children, vibrant colors, clear motion.`
      : `Cinematic, photorealistic educational video: ${prompt}. High quality, natural motion, informative.`

    const jobParams: Record<string, unknown> = {
      model: isI2V ? 'Wan-AI/wan2.7-i2v' : 'Wan-AI/wan2.7-t2v',
      prompt: safePrompt,
      negative_prompt: 'low resolution, blurry, distorted, incomplete, bad quality, watermark, text overlay',
      resolution: '720P',
      ratio: '16:9',
      seconds: '5',
    }

    if (isI2V && imageUrl) {
      jobParams.media = {
        frame_images: [{ input_image: imageUrl, frame: 'first' }],
      }
    }

    console.log('[video] creating job with model:', jobParams.model)
    const job = await (client.videos as any).create(jobParams)
    console.log('[video] job created:', JSON.stringify(job))

    if (!job?.id) {
      throw new Error(`No job ID returned: ${JSON.stringify(job)}`)
    }

    return NextResponse.json({ jobId: job.id, status: 'in_progress' })

  } catch (error) {
    console.error('[video] error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
