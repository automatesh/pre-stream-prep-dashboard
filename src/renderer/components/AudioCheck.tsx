import { useDashboard } from '../context/DashboardContext'
import type { OBSAudioInput } from '../../types/index'

function barColor(level: number): string {
  if (level >= 0.9) return 'bg-rose-500'
  if (level >= 0.7) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function AudioInputRow({
  input,
  liveLevel
}: {
  input: OBSAudioInput
  liveLevel: number
}) {
  const pct = Math.min(liveLevel * 100, 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-200">{input.name}</span>
        {input.muted && (
          <span className="rounded bg-rose-500/20 px-2 py-0.5 text-xs font-semibold text-rose-400">
            MUTED
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-full rounded-full transition-[width] duration-75 ${barColor(liveLevel)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function AudioCheck() {
  const { obs, audioLevels } = useDashboard()

  const levelMap = new Map(audioLevels.map((l) => [l.name, l.levels]))

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
        Audio
      </h2>

      {obs.audioInputs.length === 0 && (
        <p className="text-sm text-neutral-500">No audio inputs</p>
      )}

      <div className="space-y-3">
        {obs.audioInputs.map((input) => {
          const levels = levelMap.get(input.name)
          const liveLevel = levels && levels.length > 0 ? levels[0] : 0
          return (
            <AudioInputRow
              key={input.name}
              input={input}
              liveLevel={liveLevel}
            />
          )
        })}
      </div>
    </div>
  )
}
