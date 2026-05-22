import { NextRequest, NextResponse } from 'next/server'
import Together from 'together-ai'

const API_KEY = process.env.TOGETHER_API_KEY ?? 'ab85f36a6259ab35ff4f2433e1b252e893e4a4ea4577580b60e82b47d1be5abc'

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'meta-llama/Llama-3.3-70B-Instruct-Turbo', maxTokens } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Initialise inside the handler so the key is always current
    const together = new Together({ apiKey: API_KEY })

    const response = await together.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens ?? 400,  // default 400 for chat, callers can request more
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
