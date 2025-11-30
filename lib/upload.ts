import axios from 'axios'
import type {
  CreateUploadPayload,
  CreateUploadResponse,
  PendingPreview,
  UploadManagerCallbacks,
  UploadProgress,
} from '@/lib/types'

interface UploadManagerOptions extends UploadManagerCallbacks {
  maxParallel?: number
}

interface UploadTask {
  id: string
  file: File
}

const DEFAULT_PARALLEL_UPLOADS = 3

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export class UploadManager {
  private queue: UploadTask[] = []

  private active = 0

  private readonly maxParallel: number

  private readonly callbacks: UploadManagerCallbacks

  private readonly previews = new Map<string, string>()

  constructor(
    private readonly requestUpload: (
      payload: CreateUploadPayload,
    ) => Promise<CreateUploadResponse>,
    options: UploadManagerOptions = {},
  ) {
    this.maxParallel = options.maxParallel ?? DEFAULT_PARALLEL_UPLOADS
    this.callbacks = {
      onProgress: options.onProgress,
      onPreview: options.onPreview,
      onComplete: options.onComplete,
    }
  }

  enqueue(files: File[]) {
    files.forEach((file) => {
      const id = createId()
      this.queue.push({ id, file })
      const preview: PendingPreview = {
        id,
        url: URL.createObjectURL(file),
        name: file.name,
      }
      this.previews.set(id, preview.url)
      this.callbacks.onPreview?.(preview)
      this.emitProgress({
        id,
        fileName: file.name,
        size: file.size,
        status: 'idle',
        percent: 0,
      })
    })

    this.startNext()
  }

  private startNext() {
    while (this.active < this.maxParallel && this.queue.length) {
      const nextTask = this.queue.shift()
      if (nextTask) {
        this.active += 1
        this.upload(nextTask).finally(() => {
          this.active -= 1
          this.startNext()
        })
      }
    }
  }

  private async upload(task: UploadTask) {
    const { file, id } = task
    try {
      this.emitProgress({
        id,
        fileName: file.name,
        size: file.size,
        status: 'uploading',
        percent: 0,
      })

      const presigned = await this.requestUpload({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      })

      const formData = new FormData()
      Object.entries(presigned.upload.fields).forEach(([key, value]) => {
        formData.append(key, value)
      })
      formData.append('file', file)

      await axios.post(presigned.upload.url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const percent = event.total
            ? (event.loaded / event.total) * 100
            : Math.min(event.loaded / file.size, 1) * 100
          this.emitProgress({
            id,
            fileName: file.name,
            size: file.size,
            status: 'uploading',
            percent,
          })
        },
      })

      const successProgress: UploadProgress = {
        id,
        fileName: file.name,
        size: file.size,
        status: 'success',
        percent: 100,
      }
      this.emitProgress(successProgress)
      this.callbacks.onComplete?.({ id, key: presigned.key })
    } catch (error) {
      this.emitProgress({
        id,
        fileName: file.name,
        size: file.size,
        status: 'error',
        percent: 0,
        error: this.describeError(error),
      })
    } finally {
      const previewUrl = this.previews.get(id)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        this.previews.delete(id)
      }
    }
  }

  private emitProgress(progress: UploadProgress) {
    this.callbacks.onProgress?.(progress)
  }

  private describeError(error: unknown) {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message ?? error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'Upload failed'
  }
}

