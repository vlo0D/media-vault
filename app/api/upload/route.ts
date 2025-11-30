import { NextResponse } from 'next/server'
import { createUploadTarget } from '@/lib/s3/presigned'
import type { CreateUploadPayload } from '@/lib/types'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateUploadPayload
    const upload = await createUploadTarget(payload)
    return NextResponse.json(upload, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create upload target'
    const status = message.includes('limit') || message.includes('image') ? 400 : 500
    return NextResponse.json({ message }, {
      status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

