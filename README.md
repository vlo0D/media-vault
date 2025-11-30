# Media Vault

Minimal Next.js + TypeScript app that streams uploads directly from the browser to S3 (or MinIO) without proxying file bytes through the server. The UI keeps styling minimal while still delivering drag-and-drop uploads, live progress, and an optimistic gallery.

## Stack

- Next.js App Router (React 19, TypeScript, CSS modules-free styling)
- AWS SDK v3 (`@aws-sdk/client-s3`, presigned POST)
- axios upload manager with native drag-and-drop APIs
- Docker Compose + MinIO for local S3-compatible storage

## Features

- Drag-and-drop or click-to-upload zone with client-side validation (images ≤ 10 MB)
- axios-powered upload manager that tracks multiple concurrent uploads via `onUploadProgress`
- Presigned POST URLs ensure files go straight to storage; the server only exchanges metadata
- Responsive gallery with optimistic previews and delete controls
- Minimal CSS footprint for quick rendering and easy customization

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment

Copy the example file and adjust values if needed:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Credentials used by Next.js API routes to talk to S3/MinIO |
| `AWS_REGION` | Region for real S3 buckets (default `us-east-1`) |
| `S3_BUCKET_NAME` | Target bucket for uploads (default `media-vault`) |
| `S3_ENDPOINT` | Optional custom endpoint (e.g., `http://localhost:9000` for MinIO) |
| `S3_FORCE_PATH_STYLE` | Set to `true` for MinIO |
| `NEXT_PUBLIC_PUBLIC_BUCKET_URL` | Public base URL used to render gallery images |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | Credentials for the local MinIO container |

### 3. Run MinIO locally (optional but recommended)

```bash
docker compose up -d
```

The compose file launches MinIO at `http://localhost:9000` and the console at `http://localhost:9001`. It also auto-creates the bucket and sets download permissions.

**Note:** The bucket is automatically configured with public access for development purposes. This allows uploads to work without CORS configuration issues. For production, you should configure proper CORS rules and access policies.

If you need to configure CORS manually, you can create a CORS XML file and use:

```bash
cat > /tmp/cors.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration>
  <CORSRule>
    <AllowedOrigin>http://localhost:3000</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
  </CORSRule>
</CORSConfiguration>
EOF

docker run --rm --network media-vault_default \
  -v /tmp/cors.xml:/tmp/cors.xml:ro \
  --entrypoint /bin/sh minio/mc:latest \
  -c "mc alias set local http://minio:9000 minioadmin minioadmin && \
      mc cors set local/media-vault /tmp/cors.xml"
```

### 4. Start the Next.js app

```bash
yarn dev
```

Visit `http://localhost:3000` and start uploading assets.

## Architecture Decision

Uploads use `createPresignedPost` rather than `putObject` because POST forms let us enforce conditions (content length, MIME prefix) before the request ever reaches the bucket. The browser posts the file bytes straight to S3/MinIO using the signed fields, while Next.js only issues short-lived permissions. This minimizes server load, keeps credentials secret, and ensures that even in error cases the server never buffers large blobs. The upload manager centralizes axios progress tracking so we can later extend it for resumable or multipart flows without reworking the UI.

## Scripts

- `yarn dev` – start Next.js in development mode
- `yarn build` – production build
- `yarn start` – serve the production build
- `yarn lint` – run ESLint (Next.js rules)

## Next Steps

- Plug resumable/multipart uploads into the existing manager for files > 50 MB
- Add cache invalidation hooks or webhooks for external processing flows
- Layer in authentication/authorization as needed for multi-tenant scenarios