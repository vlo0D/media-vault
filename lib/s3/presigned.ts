import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import type { CreateUploadPayload, CreateUploadResponse } from '@/lib/types'
import { getS3Client } from './client'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_PREFIX = 'image/'

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

function buildObjectKey(fileName: string) {
  const cleanName = fileName.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  const id = crypto.randomUUID?.() ?? `${Date.now()}`;

  return `uploads/${id}-${cleanName}`;
}

export async function createUploadTarget(
  payload: CreateUploadPayload,
): Promise<CreateUploadResponse> {
  if (!payload.contentType.startsWith(ALLOWED_PREFIX)) {
    throw new Error('Only image uploads are supported.');
  }

  if (payload.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File exceeds 10MB limit.');
  }

  const bucket = requiredEnv('S3_BUCKET_NAME');
  const key = buildObjectKey(payload.fileName);

  const s3 = getS3Client();

  const presigned = await createPresignedPost(s3, {
    Bucket: bucket,
    Key: key,
    Fields: {
      'Content-Type': payload.contentType,
    },
    Conditions: [
      ['content-length-range', 0, MAX_FILE_SIZE_BYTES],
      ['starts-with', '$Content-Type', ALLOWED_PREFIX],
    ],
    Expires: 300,
  })

  return {
    key,
    upload: presigned,
  }
}

