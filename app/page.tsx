'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DropZone } from '@/components/DropZone'
import { Gallery } from '@/components/Gallery'
import { ProgressBar } from '@/components/ProgressBar'
import type {
  CreateUploadPayload,
  CreateUploadResponse,
  MediaFile,
  PendingPreview,
  UploadProgress,
} from '@/lib/types'
import { UploadManager } from '@/lib/upload'

async function requestPresignedUpload(
  payload: CreateUploadPayload,
): Promise<CreateUploadResponse> {
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const { message } = await response.json()
    throw new Error(message ?? 'Unable to create upload target')
  }

  return (await response.json()) as CreateUploadResponse
}

export default function HomePage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [pending, setPending] = useState<PendingPreview[]>([])
  const [progress, setProgress] = useState<Record<string, UploadProgress>>({})
  const [feedback, setFeedback] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch('/api/files')
      if (!response.ok) {
        throw new Error('Failed to load files')
      }
      const data = await response.json()
      setFiles(data.files ?? [])
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to load files')
    }
  }, [])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const uploadManager = useMemo(
    () =>
      new UploadManager(requestPresignedUpload, {
        onPreview: (preview) => {
          setPending((prev) => [...prev, preview])
        },
        onProgress: (item) => {
          setProgress((prev) => ({ ...prev, [item.id]: item }))
          if (item.status === 'error') {
            setPending((prev) => prev.filter((pendingItem) => pendingItem.id !== item.id))
          }
        },
        onComplete: ({ id }) => {
          setPending((prev) => prev.filter((item) => item.id !== id))
          setProgress((prev) => {
            const next = { ...prev }
            delete next[id]
            return next
          })
          fetchFiles()
        },
      }),
    [fetchFiles],
  )

  const handleAcceptedFiles = useCallback(
    (selected: File[]) => {
      setFeedback(null)
      uploadManager.enqueue(selected)
    },
    [uploadManager],
  )

  const handleRejectedFile = useCallback((file: File, reason: string) => {
    setFeedback(`${file.name}: ${reason}`)
  }, [])

  const handleDelete = useCallback(
    async (key: string) => {
      try {
        const response = await fetch(`/api/files?key=${encodeURIComponent(key)}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete file')
        }
        fetchFiles()
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'Unable to delete file')
      }
    },
    [fetchFiles],
  )

  const progressEntries = Object.values(progress)

  return (
    <main>
      <header className="mb-8">
        <h1 className="mb-1 text-2xl font-bold">Media Vault</h1>
        <p className="text-slate-600 m-0">
          Drag, drop, and manage assets without routing files through the server.
        </p>
      </header>

      <DropZone onFilesAccepted={handleAcceptedFiles} onRejected={handleRejectedFile} />

      {feedback ? (
        <p className="text-red-600 mt-3">{feedback}</p>
      ) : null}

      {progressEntries.length ? (
        <section className="mt-8">
          <h2 className="text-base mb-3 font-semibold">Active uploads</h2>
          {progressEntries.map((entry) => (
            <ProgressBar key={entry.id} progress={entry} />
          ))}
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-base mb-3 font-semibold">Gallery</h2>
        <Gallery items={files} pending={pending} onDelete={handleDelete} />
      </section>
    </main>
  )
}

