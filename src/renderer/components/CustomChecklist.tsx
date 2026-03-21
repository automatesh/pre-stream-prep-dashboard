import { useState } from 'react'
import { useChecklist } from '../hooks/useChecklist'

export function CustomChecklist() {
  const { items, loaded, addItem, removeItem, toggleItem, resetAll } = useChecklist()
  const [input, setInput] = useState('')

  const doneCount = items.filter((i) => i.checked).length

  const handleAdd = () => {
    if (!input.trim()) return
    addItem(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  if (!loaded) return null

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-neutral-100 font-semibold text-lg">Pre-Stream Checklist</h2>
        {items.length > 0 && (
          <span className="text-sm text-neutral-400">
            {doneCount}/{items.length} done
          </span>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add checklist item…"
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none focus:border-neutral-600 transition-colors"
        />
        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        >
          Add
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <p className="text-neutral-500 text-sm text-center py-4">Add your first checklist item</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-neutral-800/60 transition-colors group"
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => toggleItem(item.id)}
                className="accent-emerald-500 w-4 h-4 cursor-pointer shrink-0"
              />
              <span
                className={`flex-1 text-sm ${item.checked ? 'line-through text-neutral-500' : 'text-neutral-200'}`}
              >
                {item.text}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-neutral-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all text-lg leading-none"
                aria-label="Delete item"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      {items.length > 0 && (
        <button
          onClick={resetAll}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg px-3 py-1.5 text-sm transition-colors self-start"
        >
          New Stream
        </button>
      )}
    </div>
  )
}
