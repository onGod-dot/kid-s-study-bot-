import { NextRequest, NextResponse } from 'next/server'

const API_KEY = 'ab85f36a6259ab35ff4f2433e1b252e893e4a4ea4577580b60e82b47d1be5abc'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
    }

    // Make the prompt kid-friendly and educational
    const safePrompt = `Educational illustration for children: ${prompt}. Colorful, friendly, cartoon style, safe for kids, clear and simple.`

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-schnell',
        prompt: safePrompt,
        width: 512,
        height: 512,
        steps: 4,
        n: 1,
      }),
    })

    if (!response.ok) {
      let errMsg = response.statusText
      try {
        const err = await response.json()
        // Together AI can return error in different shapes
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
