import { useState, useEffect } from 'react'

const IOSInstallHint = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    const dismissed = localStorage.getItem('pwa_hint_dismissed')
    if (isIOS && !isStandalone && !dismissed) {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem('pwa_hint_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 16, right: 16, zIndex: 9999,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
      borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <span style={{ fontSize: 28 }}>📲</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#1f2937', fontSize: 14 }}>Instala esta app</p>
        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13, lineHeight: 1.4 }}>
          Toca el botón compartir <strong>⬆</strong> y luego <strong>"Agregar a pantalla de inicio"</strong>
        </p>
      </div>
      <button onClick={dismiss} style={{
        background: 'none', border: 'none', color: '#9ca3af',
        fontSize: 20, cursor: 'pointer', padding: 0, lineHeight: 1,
      }}>×</button>
    </div>
  )
}

export default IOSInstallHint
