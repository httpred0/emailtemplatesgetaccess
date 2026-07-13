import { useState } from 'react'
import { StoreProvider } from './store'
import { Home } from './pages/Home'
import { Builder } from './pages/Builder'
import { SignatureBuilder } from './pages/SignatureBuilder'

type View =
  | { page: 'home' }
  | { page: 'builder'; templateId: string }
  | { page: 'signature'; signatureId: string }

export default function App() {
  const [view, setView] = useState<View>({ page: 'home' })
  const isBuilder = view.page === 'builder' || view.page === 'signature'

  return (
    <StoreProvider>
      <div className={isBuilder ? 'app app--builder' : 'app'}>
        {view.page === 'home' && (
          <Home
            onOpen={(id) => setView({ page: 'builder', templateId: id })}
            onOpenSignature={(id) => setView({ page: 'signature', signatureId: id })}
          />
        )}
        {view.page === 'builder' && (
          <Builder templateId={view.templateId} onBack={() => setView({ page: 'home' })} />
        )}
        {view.page === 'signature' && (
          <SignatureBuilder signatureId={view.signatureId} onBack={() => setView({ page: 'home' })} />
        )}
      </div>
    </StoreProvider>
  )
}
