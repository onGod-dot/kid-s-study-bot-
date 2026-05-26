import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.TOGETHER_API_KEY ?? 'ab85f36a6259ab35ff4f2433e1b252e893e4a4ea4577580b60e82b47d1be5abc'

// Uses FLUX.1-kontext-pro — Together AI's image editing model.
// Takes an existing image URL + a text instruction and returns an edited image.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageUrl, instruction, ageGroup = 'kids' } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ error: '"imageUrl" is required' }, { status: 400 })
    }
    if (!instruction || typeof instruction !== 'string') {
      return NextResponse.json({ error: '"instruction" is required' }, { status: 400 })
    }

    // Build a safe, age-appropriate edit prompt
    const safeInstruction = ageGroup === 'kids'
      ? `${instruction}. Keep the style colorful, friendly and safe for children.`
      : `${instruction}. Keep the result photorealistic and educational.`

    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/FLUX.1-kontext-pro',
        prompt: safeInstruction,
        image_url: imageUrl,
        n: 1,
        width: 768,
        height: 768,
      }),
    })

    if (!response.ok) {
      let errMsg = response.statusText
      try {
        const err = await response.json()
        errMsg = err?.error?.message || err?.error || err?.message || errMsg
      } catch {}
      console.error('Edit image API error:', response.status, errMsg)
      throw new Error(`Edit Image API Error (${response.status}): ${errMsg}`)
    }

    const data = await response.json()
    const resultUrl = data.data?.[0]?.url

    if (!resultUrl) {
      console.error('No image URL in edit response:', JSON.stringify(data))
      throw new Error('No edited image URL returned from API')
    }

    return NextResponse.json({ imageUrl: resultUrl })
  } catch (error) {
    console.error('Edit image error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
