export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface UploadProgress {
  id: string
  fileName: string
  size: number
  status: UploadStatus
  percent: number
  error?: string
}

export interface MediaFile {
  key: string
  url: string
  size: number
  lastModified: string
}

export interface PendingPreview {
  id: string
  url: string
  name: string
}

export interface PresignedPostData {
  url: string
  fields: Record<string, string>
}

export interface CreateUploadResponse {
  key: string
  upload: PresignedPostData
}

export interface CreateUploadPayload {
  fileName: string
  contentType: string
  size: number
}

export interface UploadManagerCallbacks {
  onProgress?: (progress: UploadProgress) => void
  onPreview?: (preview: PendingPreview) => void
  onComplete?: (result: { id: string; key: string }) => void
}

