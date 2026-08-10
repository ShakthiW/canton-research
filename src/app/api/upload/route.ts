import { NextResponse } from 'next/server'
import { uploadImageToFirebase } from '@/lib/actions/upload'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const result = await uploadImageToFirebase(formData)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ url: result.url })
  } catch (err) {
    console.error('API upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal upload error' },
      { status: 500 }
    )
  }
}
