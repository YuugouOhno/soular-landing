import { useState } from 'react'
import SoularLanding from './components/SoularLanding'
import SoularLandingGreen from './components/SoularLandingGreen'
import SoularLandingBlue from './components/SoularLandingBlue'

const VARIANTS = {
  default: { label: 'Default', component: SoularLanding },
  green: { label: 'Green', component: SoularLandingGreen },
  blue: { label: 'Blue', component: SoularLandingBlue },
}

function DevModal({ currentVariant, onChangeVariant, isOpen, onToggle }) {
  return (
    <div style={{ position: 'fixed', bottom: '16px', left: '16px', zIndex: 9999 }}>
      {isOpen ? (
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '8px',
            padding: '16px',
            color: 'white',
            minWidth: '180px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Dev Mode
            </span>
            <button
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                lineHeight: '1',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(VARIANTS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => onChangeVariant(key)}
                style={{
                  background: currentVariant === key ? '#3b82f6' : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                  transition: 'background 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={onToggle}
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Open Dev Mode"
        >
          ⚙
        </button>
      )}
    </div>
  )
}

function App() {
  const [currentVariant, setCurrentVariant] = useState('default')
  const [isDevModalOpen, setIsDevModalOpen] = useState(false)

  const CurrentComponent = VARIANTS[currentVariant].component

  return (
    <>
      <CurrentComponent />
      <DevModal
        currentVariant={currentVariant}
        onChangeVariant={setCurrentVariant}
        isOpen={isDevModalOpen}
        onToggle={() => setIsDevModalOpen(!isDevModalOpen)}
      />
    </>
  )
}

export default App
