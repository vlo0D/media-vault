# Full Stack Developer Interview Task: The Resumable Media Vault

## Context
We are building a high-performance media management system where users upload high-resolution assets. We need a robust Next.js application that handles file uploads efficiently without blocking the server.

Your goal is to build a "Media Vault" that allows users to upload files directly to cloud storage (AWS S3) and view them in a responsive gallery.

## Core Requirements

### 1. The Frontend (Client-Side Logic)
*Do not use high-level upload libraries (e.g., `react-dropzone`, `uppy`, `uploadthing`). You must implement the interaction logic using native Browser APIs.*

- **Custom Drag-and-Drop Zone:**
  - Create a visual area to drop files.
  - Implement client-side validation (File Type: Images only, Max Size: 10MB).
- **Upload Progress:**
  - Display a real-time progress bar for active uploads.
  - **Constraint:** You must handle the upload stream effectively to track progress (e.g., using `XMLHttpRequest` or `axios` events, or ReadableStreams).
- **Media Gallery:**
  - Display uploaded images in a responsive grid.
  - **Optimistic UI:** When a file is uploaded, it should appear in the list immediately (as a preview), even before the server confirms the refresh.

### 2. The Backend (Next.js App Router)
*All backend logic must reside within Next.js API Routes or Server Actions. Do not use a separate Node/Express server.*

- **Direct-to-Storage Pattern:**
  - **Critical:** The file binary data **must not** pass through the Next.js server/lambda.
  - Implement a mechanism (e.g., S3 Presigned URLs or Presigned POST) where the client requests permission to upload, and the browser uploads directly to the S3 bucket.
- **Media Management:**
  - Endpoint/Action to list files currently in the bucket.
  - Endpoint/Action to delete a file.

### 3. AWS S3 Integration
- Use the AWS SDK v3.
- Configure a bucket (or a local mock like MinIO/LocalStack) to accept the uploads.
- Ensure the bucket CORS configuration allows the direct browser uploads.

## Technical Constraints

1.  **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS.
2.  **No "Magic" Upload Libraries:** You must implement the upload manager logic yourself.
3.  **Performance:** The application should handle uploading 3-5 files simultaneously without freezing the UI.
4.  **Type Safety:** Ensure interfaces are shared correctly between the API responses and React components.

## Deliverables

1.  **Source Code:** Hosted in a Git repository.
2.  **README:**
    - Setup instructions (how to run locally).
    - Environment variable configuration (AWS Keys, Bucket Name).
    - **Architecture Decision:** A short paragraph explaining why you chose your specific upload method (e.g., `putObject` vs `createPresignedPost`) and how you handle the "Direct-to-Storage" security.
3.  **Docker (Optional):** A `docker-compose` file to spin up a local MinIO instance if you do not wish to use a real AWS account.

## Time Allocation
You have **8-10 hours** to complete this task.

**Priorities:**
1.  Functionality (Does the direct upload work?)
2.  Code Quality (Is the React state managed cleanly?)
3.  UX/UI (Does the progress bar work smoothly?)

---

### Challenge Mode (Bonus)
*If you finish early:*
Implement **Resumable/Multipart Uploads**. If a user uploads a file larger than 50MB, slice the file in the browser and upload it in chunks using S3 Multipart Upload.