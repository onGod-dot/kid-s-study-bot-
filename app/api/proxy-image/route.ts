import { NextRequest, NextResponse } from 'next/server'

// Proxies Together AI image URLs server-side so the browser can download them
// without hitting CORS or missing User-Agent restrictions.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 })
  }

  // Only allow Together AI CDN URLs
  const allowed = [
    'api.together.ai',
    'api.together.xyz',
    'cdn.together.ai',
    'together.ai',
  ]
  let hostname: string
  try {
    hostname = new URL(imageUrl).hostname
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!allowed.some(h => hostname === h || hostname.endsWith(`.${h}`))) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 })
  }

  try {
    const upstream = await fetch(imageUrl, {
      headers: { 'User-Agent': 'BuddyAI/1.0' },
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') ?? 'image/png'
    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment; filename="buddy-image.png"',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('Proxy image error:', err)
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
  }
}
