import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export const MODELS = [
  'recursive/flint-v1.0:free',
  'dots-studio/dots-3-note-preview:free',
  'liquid/lfm-2.5-2.6b:free',
  'nvidia/nemotron-3.5-super-vl:free',
] as const

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const systemMessage = { role: 'system', content: 'You are Night AI, a helpful assistant. Answer clearly and concisely.' }

type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

function errorText(status: number) {
  if (status === 429) return 'This model is busy, try again in a minute or pick another model'
  if (status === 402 || status === 404) return 'This model is unavailable. Please switch to another model.'
  return 'The model could not respond. Please try another model.'
}

export async function POST(request: Request) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return NextResponse.json({ error: 'AI key is not configured' }, { status: 503 })

  try {
    const body = await request.json()
    const requested = MODELS.includes(body.model) ? body.model : MODELS[0]
    const messages = Array.isArray(body.messages) ? body.messages.filter((m: ChatMessage) => m?.content && ['user', 'assistant', 'system'].includes(m.role)) : []
    if (!messages.length) return NextResponse.json({ error: 'Please enter a message.' }, { status: 400 })

    const start = MODELS.indexOf(requested)
    const candidates = [requested, ...MODELS.filter((model) => model !== requested)].slice(0, 2)
    let lastError = 'The model could not respond. Please try another model.'

    for (let attempt = 0; attempt < candidates.length; attempt += 1) {
      const model = candidates[attempt]
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://nightfall.site', 'X-Title': 'Night AI' },
        body: JSON.stringify({ model, messages: [systemMessage, ...messages], stream: true }),
      })
      if (response.ok && response.body) {
        const encoder = new TextEncoder()
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        const stream = new ReadableStream({
          async start(controller) {
            controller.enqueue(encoder.encode(`event: model\ndata: ${JSON.stringify({ model, fallback: attempt > 0 })}\n\n`))
            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break
                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''
                for (const line of lines) {
                  if (!line.startsWith('data: ')) continue
                  const payload = line.slice(6).trim()
                  if (payload === '[DONE]') continue
                  try {
                    const delta = JSON.parse(payload).choices?.[0]?.delta?.content
                    if (delta) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: delta })}\n\n`))
                  } catch { /* Ignore malformed provider chunks. */ }
                }
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            } catch (error) {
              console.error('[night-ai] stream error', error)
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'The AI connection ended unexpectedly.' })}\n\n`))
              controller.close()
            }
          },
        })
        return new Response(stream, { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } })
      }
      const responseBody = await response.text()
      console.error('[night-ai] OpenRouter error', { model, status: response.status, body: responseBody })
      lastError = errorText(response.status)
      if (response.status === 401 || response.status === 403) break
    }
    return NextResponse.json({ error: lastError }, { status: 502 })
  } catch (error) {
    console.error('[night-ai] request error', error)
    return NextResponse.json({ error: 'Unable to contact Night AI.' }, { status: 500 })
  }
}
