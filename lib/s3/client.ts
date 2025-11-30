import { S3Client } from '@aws-sdk/client-s3'

let client: S3Client | null = null

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`)
  }

  return value;
}

export function getS3Client() {
  if (client) {
    return client;
  }

  const region = process.env.AWS_REGION ?? 'us-east-1'
  const endpoint = process.env.S3_ENDPOINT
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true'

  client = new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
      secretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
    },
  })

  return client
}

