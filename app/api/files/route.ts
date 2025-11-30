import {
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import { getS3Client } from '@/lib/s3/client'
import type { MediaFile } from '@/lib/types'

function requiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }
  return value
}

function publicUrlFor(key: string, bucket: string) {
  const configured = process.env.NEXT_PUBLIC_PUBLIC_BUCKET_URL
  if (configured) {
    return `${configured.replace(/\/$/, '')}/${key}`
  }

  const region = process.env.AWS_REGION ?? 'us-east-1'
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
}

export async function GET() {
  try {
    const bucket = requiredEnv('S3_BUCKET_NAME')
    const client = getS3Client()
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'uploads/',
      }),
    )

    const files: MediaFile[] =
      result.Contents?.filter((item) => item.Key && typeof item.Size === 'number').map(
        (item) => ({
          key: item.Key!,
          size: item.Size ?? 0,
          lastModified: item.LastModified?.toISOString() ?? new Date().toISOString(),
          url: publicUrlFor(item.Key!, bucket),
        }),
      ) ?? []

    return NextResponse.json({ files }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list files'
    return NextResponse.json({ message }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (!key) {
      return NextResponse.json({ message: 'Missing key parameter' }, {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      })
    }
    const bucket = requiredEnv('S3_BUCKET_NAME')
    const client = getS3Client()
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    )

    return NextResponse.json({ deleted: key }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete file'
    const status = message.includes('Missing key') ? 400 : 500
    return NextResponse.json({ message }, {
      status,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
}

