import { NextRequest, NextResponse } from 'next/server'
import Together from 'together-ai'

const API_KEY = process.env.TOGETHER_API_KEY ?? ''

const together = new Together({ apiKey: API_KEY })

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const { messages, model = 'meta-llama/Llama-3.3-70B-Instruct-Turbo' } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const response = await together.chat.completions.create({
      model,
      messages,
      max_tokens: 400,   // keep answers concise — was 1000
      temperature: 0.7,
    })

    const content = response.choices?.[0]?.message?.content

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Empty response from AI model' }, { status: 500 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
