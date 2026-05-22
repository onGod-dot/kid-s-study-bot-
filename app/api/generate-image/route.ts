import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.TOGETHER_API_KEY ?? ''

// Kids  → FLUX.1-schnell: fast, colourful, cartoon-friendly (4 steps)
// Teens → FLUX.1-dev:     realistic, photographic quality  (28 steps)
const MODELS = {
  kids: {
    id: 'black-forest-labs/FLUX.1-schnell',
    steps: 4,
    buildPrompt: (subject: string) =>
      `Educational illustration for children: ${subject}. Colorful, friendly, cartoon style, safe for kids, clear and simple.`,
  },
  teens: {
    id: 'black-forest-labs/FLUX.1-dev',
    steps: 28,
    buildPrompt: (subject: string) =>
      `Photorealistic educational image: ${subject}. High detail, natural lighting, accurate and informative, suitable for teenagers, no text overlays.`,
  },
} as const

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const { prompt, ageGroup = 'kids' } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    const config = MODELS[ageGroup as keyof typeof MODELS] ?? MODELS.kids
    const safePrompt = config.buildPrompt(prompt)

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.id,
        prompt: safePrompt,
        width: 768,
        height: 768,
        steps: config.steps,
        n: 1,
      }),
    })

    if (!response.ok) {
      let errMsg = response.statusText
      try {
        const err = await response.json()
        errMsg = err?.error?.message || err?.error || err?.message || errMsg
      } catch {}
      console.error('Image API error response:', response.status, errMsg)
      throw new Error(`Image API Error (${response.status}): ${errMsg}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      console.error('No image URL in response:', JSON.stringify(data))
      throw new Error('No image URL returned from API')
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

