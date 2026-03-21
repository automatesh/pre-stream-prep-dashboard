import { DashboardProvider } from './context/DashboardContext'
import AllClearIndicator from './components/AllClearIndicator'
import ConnectionPanel from './components/ConnectionPanel'
import ModelCheck from './components/ModelCheck'
import AudioCheck from './components/AudioCheck'
import SceneAudit from './components/SceneAudit'
import { CustomChecklist } from './components/CustomChecklist'
import { StreamRunsheet } from './components/StreamRunsheet'

export default function App() {
  return (
    <DashboardProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* All Clear indicator */}
          <section className="py-4">
            <AllClearIndicator />
          </section>

          {/* Connection status */}
          <section>
            <ConnectionPanel />
          </section>

          {/* Main grid: left column (Model + Audio), right column (Scenes) */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <ModelCheck />
              <AudioCheck />
            </div>
            <div>
              <SceneAudit />
            </div>
          </section>

          {/* Checklist + Runsheet */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CustomChecklist />
            <StreamRunsheet />
          </section>
        </div>
      </div>
    </DashboardProvider>
  )
}
