import { useDashboard } from '../context/DashboardContext'
import type { ConnectionStatus } from '../../types/index'

const statusColor: Record<ConnectionStatus, string> = {
  connected: 'bg-emerald-500',
  connecting: 'bg-amber-500 animate-pulse',
  disconnected: 'bg-rose-500',
  error: 'bg-rose-500'
}

const statusLabel: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  connecting: 'Connecting...',
  disconnected: 'Disconnected',
  error: 'Error'
}

function StatusDot({
  label,
  status,
  extra,
  onReconnect
}: {
  label: string
  status: ConnectionStatus
  extra?: string
  onReconnect?: () => void
}) {
  const canReconnect = status === 'disconnected' || status === 'error'

  return (
    <button
      type="button"
      onClick={canReconnect ? onReconnect : undefined}
      disabled={!canReconnect}
      className={`flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 transition-colors ${canReconnect ? 'cursor-pointer hover:bg-neutral-800' : 'cursor-default'}`}
    >
      <span className={`inline-block h-3 w-3 rounded-full ${statusColor[status]}`} />
      <span className="text-sm font-medium text-neutral-100">{label}</span>
      <span className="text-xs text-neutral-400">
        {statusLabel[status]}
        {extra ? ` \u00b7 ${extra}` : ''}
      </span>
    </button>
  )
}

export default function ConnectionPanel() {
  const { obs, vts, network } = useDashboard()

  return (
    <div className="flex flex-wrap gap-3">
      <StatusDot
        label="OBS"
        status={obs.status}
        onReconnect={() => window.api.obsConnect()}
      />
      <StatusDot
        label="VTube Studio"
        status={vts.status}
        onReconnect={() => window.api.vtsConnect()}
      />
      <StatusDot
        label="Internet"
        status={network.status}
        extra={network.uploadSpeedMbps !== null ? `${network.uploadSpeedMbps.toFixed(1)} Mbps up` : undefined}
        onReconnect={() => window.api.networkCheck()}
      />
    </div>
  )
}
