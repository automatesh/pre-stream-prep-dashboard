import https from 'node:https'
import type { NetworkState } from '../types/index'

export interface NetCheck {
  check(): Promise<void>
  startPeriodicCheck(intervalMs: number): void
  stopPeriodicCheck(): void
  getState(): NetworkState
  onStateChange(callback: (state: NetworkState) => void): void
}

const CHECK_TIMEOUT_MS = 10_000
const CHECK_URL = 'https://clients3.google.com/generate_204'

function measureConnectivity(): Promise<{ latencyMs: number }> {
  return new Promise((resolve, reject) => {
    const start = Date.now()

    const req = https.request(
      CHECK_URL,
      { method: 'HEAD', timeout: CHECK_TIMEOUT_MS },
      (res) => {
        // Consume response data to free up memory
        res.resume()
        const latencyMs = Date.now() - start

        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          resolve({ latencyMs })
        } else {
          reject(new Error(`Unexpected status: ${res.statusCode}`))
        }
      }
    )

    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })

    req.on('error', (err) => {
      reject(err)
    })

    req.end()
  })
}

export function createNetCheck(): NetCheck {
  let state: NetworkState = {
    status: 'disconnected',
    uploadSpeedMbps: null,
    lastChecked: null
  }
  let intervalId: ReturnType<typeof setInterval> | null = null
  const listeners: ((state: NetworkState) => void)[] = []

  function setState(next: NetworkState): void {
    state = next
    for (const cb of listeners) {
      cb(state)
    }
  }

  return {
    async check() {
      setState({ ...state, status: 'connecting' })

      try {
        const { latencyMs } = await measureConnectivity()
        setState({
          status: 'connected',
          uploadSpeedMbps: latencyMs,
          lastChecked: Date.now()
        })
      } catch (err) {
        const isTimeout =
          err instanceof Error && (err.message === 'timeout' || 'code' in err && (err as NodeJS.ErrnoException).code === 'ETIMEDOUT')

        setState({
          status: isTimeout ? 'disconnected' : 'error',
          uploadSpeedMbps: null,
          lastChecked: Date.now()
        })
      }
    },

    startPeriodicCheck(intervalMs) {
      this.stopPeriodicCheck()
      this.check()
      intervalId = setInterval(() => this.check(), intervalMs)
    },

    stopPeriodicCheck() {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    },

    getState() {
      return state
    },

    onStateChange(callback) {
      listeners.push(callback)
    }
  }
}
