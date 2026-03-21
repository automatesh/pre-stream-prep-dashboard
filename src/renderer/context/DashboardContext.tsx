import { createContext, useContext, type ReactNode } from 'react'
import { useIpc, type IpcState } from '../hooks/useIpc'

const DashboardContext = createContext<IpcState | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const state = useIpc()
  return (
    <DashboardContext.Provider value={state}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): IpcState {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
