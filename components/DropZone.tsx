import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'

interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void
  maxSizeMb?: number
  onRejected?: (file: File, reason: string) => void
}

const MAX_SIZE_MB = 10

function validateFiles(
  files: FileList | null,
  maxSizeMb: number,
  onRejected?: (file: File, reason: string) => void,
) {
  if (!files) {
    return []
  }

  const accepted: File[] = []
  const maxSizeBytes = maxSizeMb * 1024 * 1024

  Array.from(files).forEach((file) => {
    if (!file.type.startsWith('image/')) {
      onRejected?.(file, 'Only image files are allowed.')
      return
    }

    if (file.size > maxSizeBytes) {
      onRejected?.(file, 'File exceeds the 10MB size limit.')
      return
    }

    accepted.push(file)
  })

  return accepted
}

export function DropZone({
  onFilesAccepted,
  maxSizeMb = MAX_SIZE_MB,
  onRejected,
}: DropZoneProps) {
  const [isActive, setIsActive] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const accepted = validateFiles(files, maxSizeMb, onRejected)
      if (accepted.length) {
        onFilesAccepted(accepted)
      }
      setIsActive(false)
    },
    [maxSizeMb, onFilesAccepted, onRejected],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      const files = event.dataTransfer.files
      handleFiles(files)
    },
    [handleFiles],
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files)
      event.target.value = ''
    },
    [handleFiles],
  )

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsActive(true)
      }}
      onDragLeave={(event) => {
        event.preventDefault()
        setIsActive(false)
      }}
      onDrop={handleDrop}
      className={`border-2 border-dashed border-slate-400 rounded-xl p-8 text-center cursor-pointer transition-colors duration-150 ${
        isActive ? 'bg-blue-50' : 'bg-white'
      }`}
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
      <p className="m-0 text-lg">Drag & drop images here, or click to select</p>
      <small className="text-slate-600">Images up to {maxSizeMb}MB</small>
    </div>
  )
}

