import { useDashboard } from '../context/DashboardContext'

export default function ModelCheck() {
  const { vts } = useDashboard()
  const model = vts.currentModel
  const tracking = vts.faceTracking

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
        VTube Studio
      </h2>

      <div>
        <p className="text-lg font-medium text-neutral-100">
          {model && model.loaded ? model.name : <span className="text-neutral-500">No model loaded</span>}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            tracking.faceDetected ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />
        <span className="text-sm text-neutral-300">
          {tracking.faceDetected ? 'Face detected' : 'No face'}
        </span>
      </div>

      <p className="text-sm text-neutral-400">
        {tracking.parameterCount} tracking parameter{tracking.parameterCount !== 1 ? 's' : ''} active
      </p>
    </div>
  )
}
