import type { UploadProgress } from '@/lib/types'

interface ProgressBarProps {
  progress: UploadProgress
}

const STATUS_COLOR: Record<UploadProgress['status'], string> = {
  idle: 'bg-blue-200',
  uploading: 'bg-blue-600',
  success: 'bg-green-600',
  error: 'bg-red-600',
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const { fileName, percent, status, error } = progress

  return (
    <div className="border border-slate-300 rounded-lg p-3 mb-3 bg-white">
      <div className="flex justify-between mb-1.5 gap-2 text-sm">
        <span className="font-semibold text-slate-900">{fileName}</span>
        <span className="text-slate-600">{Math.round(percent)}%</span>
      </div>
      <div className="w-full h-2 rounded bg-slate-200 overflow-hidden">
        <span
          className={`block h-full ${STATUS_COLOR[status]} transition-all duration-150`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {status === 'error' && error ? (
        <p className="text-red-600 mt-1.5 text-xs">{error}</p>
      ) : null}
    </div>
  )
}

