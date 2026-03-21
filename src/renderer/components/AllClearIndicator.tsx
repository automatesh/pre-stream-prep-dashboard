import { useDashboard } from '../context/DashboardContext'
import type { ConnectionStatus } from '../../types/index'
import type { HealthLevel } from '../../types/index'

function computeHealth(
  obsStatus: ConnectionStatus,
  vtsStatus: ConnectionStatus,
  netStatus: ConnectionStatus
): HealthLevel {
  if (
    obsStatus === 'connected' &&
    vtsStatus === 'connected' &&
    netStatus === 'connected'
  ) {
    return 'green'
  }
  if (
    obsStatus === 'error' ||
    vtsStatus === 'error' ||
    obsStatus === 'disconnected' ||
    vtsStatus === 'disconnected'
  ) {
    return 'red'
  }
  return 'yellow'
}

const config: Record<HealthLevel, { ring: string; bg: string; glow: string; text: string; label: string }> = {
  green: {
    ring: 'ring-emerald-500/50',
    bg: 'bg-emerald-500',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.45)]',
    text: 'text-emerald-400',
    label: 'All Clear \u2014 Ready to Stream'
  },
  yellow: {
    ring: 'ring-amber-500/50',
    bg: 'bg-amber-500',
    glow: '',
    text: 'text-amber-400',
    label: 'Warnings \u2014 Check Issues'
  },
  red: {
    ring: 'ring-rose-500/50',
    bg: 'bg-rose-500',
    glow: '',
    text: 'text-rose-400',
    label: 'Not Ready'
  }
}

export default function AllClearIndicator() {
  const { obs, vts, network } = useDashboard()
  const health = computeHealth(obs.status, vts.status, network.status)
  const c = config[health]

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`h-24 w-24 rounded-full ring-4 ${c.ring} ${c.bg} ${c.glow} ${health === 'green' ? 'animate-pulse' : ''} transition-colors duration-500`}
      />
      <p className={`text-lg font-semibold ${c.text}`}>
        {c.label}
      </p>
    </div>
  )
}
