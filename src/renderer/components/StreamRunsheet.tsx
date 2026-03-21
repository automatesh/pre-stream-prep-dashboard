import { useState } from 'react'
import { useRunsheet } from '../hooks/useRunsheet'

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function StreamRunsheet() {
  const {
    segments,
    loaded,
    addSegment,
    removeSegment,
    moveSegment,
    updateSegment,
    totalDuration
  } = useRunsheet()

  const [newTitle, setNewTitle] = useState('')
  const [newDuration, setNewDuration] = useState(15)

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addSegment(newTitle, newDuration)
    setNewTitle('')
    setNewDuration(15)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  if (!loaded) return null

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-neutral-100 font-semibold text-lg">Stream Runsheet</h2>
        {segments.length > 0 && (
          <span className="text-sm text-neutral-400">Total: {formatDuration(totalDuration)}</span>
        )}
      </div>

      {/* Segments */}
      {segments.length === 0 ? (
        <p className="text-neutral-500 text-sm text-center py-4">Plan your stream segments</p>
      ) : (
        <div className="flex flex-col gap-0">
          {segments.map((seg, idx) => (
            <div key={seg.id}>
              {/* Segment row */}
              <div className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-neutral-800/60 transition-colors group">
                {/* Move buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveSegment(seg.id, 'up')}
                    disabled={idx === 0}
                    className="text-neutral-500 hover:text-neutral-300 disabled:opacity-20 text-xs leading-none transition-colors"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveSegment(seg.id, 'down')}
                    disabled={idx === segments.length - 1}
                    className="text-neutral-500 hover:text-neutral-300 disabled:opacity-20 text-xs leading-none transition-colors"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>

                {/* Order indicator */}
                <span className="text-neutral-600 text-xs font-mono w-5 text-center shrink-0">
                  {idx + 1}
                </span>

                {/* Title */}
                <input
                  type="text"
                  value={seg.title}
                  onChange={(e) => updateSegment(seg.id, { title: e.target.value })}
                  className="flex-1 bg-transparent border-b border-transparent hover:border-neutral-700 focus:border-neutral-600 text-sm text-neutral-200 outline-none px-1 py-0.5 transition-colors"
                />

                {/* Duration */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    value={seg.durationMinutes}
                    onChange={(e) =>
                      updateSegment(seg.id, {
                        durationMinutes: Math.max(1, parseInt(e.target.value) || 1)
                      })
                    }
                    min={1}
                    className="w-14 bg-neutral-800 border border-neutral-700 rounded px-2 py-0.5 text-sm text-neutral-200 text-right outline-none focus:border-neutral-600 transition-colors"
                  />
                  <span className="text-neutral-500 text-xs">min</span>
                </div>

                {/* Delete */}
                <button
                  onClick={() => removeSegment(seg.id)}
                  className="text-neutral-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none shrink-0"
                  aria-label="Delete segment"
                >
                  &times;
                </button>
              </div>

              {/* Arrow between segments */}
              {idx < segments.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <span className="text-neutral-700 text-xs">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add segment */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Segment title…"
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-600 transition-colors"
        />
        <input
          type="number"
          value={newDuration}
          onChange={(e) => setNewDuration(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          className="w-20 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 text-right outline-none focus:border-neutral-600 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!newTitle.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}
