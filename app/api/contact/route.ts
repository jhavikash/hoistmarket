import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendContactFormEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, subject, message } = await req.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'name, email, and message required' }, { status: 400 })
    }
    await sendContactFormEmail({ name, email, company, subject: subject ?? 'General', message })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
