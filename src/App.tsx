import { useState } from 'react'
import { StoreProvider } from './store'
import { Home } from './pages/Home'
import { Builder } from './pages/Builder'

type View = { page: 'home' } | { page: 'builder'; templateId: string }

export default function App() {
  const [view, setView] = useState<View>({ page: 'home' })

  return (
    <StoreProvider>
      <div className={view.page === 'builder' ? 'app app--builder' : 'app'}>
        {view.page === 'home' ? (
          <Home onOpen={(id) => setView({ page: 'builder', templateId: id })} />
        ) : (
          <Builder templateId={view.templateId} onBack={() => setView({ page: 'home' })} />
        )}
      </div>
    </StoreProvider>
  )
}
