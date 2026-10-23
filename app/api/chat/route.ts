import { NextResponse } from 'next/server'

const allowed = new Set(['dots-studio/dots-3-note-preview:free','poolside/laguna-s-2.1:free','nvidia/nemotron-3.5-super-vl:free'])

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!allowed.has(body.model) || !Array.isArray(body.messages)) return NextResponse.json({ error: 'Invalid model or messages.' }, { status: 400 })
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': 'https://nightfall.local', 'X-Title': 'Night AI' }, body: JSON.stringify({ model: body.model, messages: body.messages.map((message: { from?: string; text?: string; role?: string; content?: string }) => ({ role: message.role || (message.from === 'you' ? 'user' : 'assistant'), content: message.content || message.text || '' })) }) })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ error: 'The model could not respond.' }, { status: 502 })
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || 'I did not receive a response.' })
  } catch { return NextResponse.json({ error: 'Unable to contact Night AI.' }, { status: 500 }) }
}
