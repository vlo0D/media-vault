import Image from 'next/image'
import type { MediaFile, PendingPreview } from '@/lib/types'

interface GalleryProps {
  items: MediaFile[]
  pending?: PendingPreview[]
  onDelete?: (key: string) => void
}

function formatSize(bytes: number) {
  if (bytes > 1_000_000) {
    return `${(bytes / 1_000_000).toFixed(1)} MB`
  }
  return `${(bytes / 1_000).toFixed(1)} KB`
}

function GalleryItem({
  src,
  name,
  size,
  isPending,
  onDelete,
}: {
  src: string
  name: string
  size?: number
  isPending?: boolean
  onDelete?: () => void
}) {
  return (
    <article className="rounded-xl border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div className="relative w-full h-40">
        <Image src={src} alt={name} fill className="object-cover" sizes="160px" />
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex justify-between gap-2">
          <span className="font-semibold text-sm text-slate-900 truncate">{name}</span>
          {isPending ? <span className="text-xs text-slate-500">pending</span> : null}
        </div>
        {typeof size === 'number' ? (
          <span className="text-xs text-slate-600">{formatSize(size)}</span>
        ) : null}
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="mt-1 px-2 py-1.5 rounded-lg border border-rose-400 bg-rose-50 text-rose-700 cursor-pointer text-xs hover:bg-rose-100"
          >
            Delete
          </button>
        ) : null}
      </div>
    </article>
  )
}

export function Gallery({ items, pending = [], onDelete }: GalleryProps) {
  if (!items.length && !pending.length) {
    return (
      <p className="text-slate-600 mt-4">Upload images to populate your vault.</p>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 mt-6">
      {pending.map((item) => (
        <GalleryItem
          key={item.id}
          src={item.url}
          name={item.name}
          isPending
        />
      ))}
      {items.map((item) => (
        <GalleryItem
          key={item.key}
          src={item.url}
          name={item.key.split('/').pop() ?? item.key}
          size={item.size}
          onDelete={onDelete ? () => onDelete(item.key) : undefined}
        />
      ))}
    </div>
  )
}

