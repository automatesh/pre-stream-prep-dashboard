import { useDashboard } from '../context/DashboardContext'

export default function SceneAudit() {
  const { obs } = useDashboard()

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
        OBS Scenes
      </h2>

      {/* Output settings */}
      {obs.outputSettings && (
        <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
          <span className="rounded bg-neutral-800 px-2 py-0.5">
            {obs.outputSettings.width}x{obs.outputSettings.height}
          </span>
          <span className="rounded bg-neutral-800 px-2 py-0.5">
            {obs.outputSettings.fps} FPS
          </span>
          <span className="rounded bg-neutral-800 px-2 py-0.5">
            {obs.outputSettings.bitrate} kbps
          </span>
        </div>
      )}

      {/* Streaming / Recording badges */}
      <div className="flex gap-2">
        {obs.isStreaming && (
          <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-medium text-emerald-400">
            LIVE
          </span>
        )}
        {obs.isRecording && (
          <span className="rounded-full bg-rose-500/20 px-3 py-0.5 text-xs font-medium text-rose-400">
            REC
          </span>
        )}
      </div>

      {/* Scene list */}
      <div className="space-y-2">
        {obs.scenes.length === 0 && (
          <p className="text-sm text-neutral-500">No scenes available</p>
        )}
        {obs.scenes.map((scene) => {
          const isActive = scene.name === obs.activeScene
          return (
            <div
              key={scene.name}
              className={`rounded-lg border p-3 ${
                isActive
                  ? 'border-emerald-700 bg-emerald-950/30'
                  : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                )}
                <span className={`text-sm font-medium ${isActive ? 'text-emerald-300' : 'text-neutral-200'}`}>
                  {scene.name}
                </span>
              </div>

              {scene.sources.length > 0 && (
                <ul className="mt-2 space-y-1 pl-4">
                  {scene.sources.map((source) => (
                    <li key={source.name} className="flex items-center gap-2 text-xs">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          source.enabled ? 'bg-emerald-500' : 'bg-neutral-600'
                        }`}
                      />
                      <span className={source.enabled ? 'text-neutral-300' : 'text-neutral-500'}>
                        {source.name}
                      </span>
                      {!source.enabled && (
                        <span className="text-neutral-600">disabled</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
