import { useState, useEffect } from 'react'

const IOSInstallHint = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.navigator.standalone === true
    const dismissed = localStorage.getItem('pwa_hint_dismissed')
    if (isIOS && !isStandalone && !dismissed) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="glass fixed bottom-[72px] left-3 right-3 z-[9999] rounded-[var(--radius-md)] p-3.5 animate-slideUp flex items-start gap-2.5">
      <span className="text-2xl leading-none">📲</span>
      <div className="flex-1">
        <p className="m-0 font-semibold text-sm text-base-content">
          Instala esta app
        </p>
        <p className="m-0 mt-0.5 text-xs text-base-content/60 leading-relaxed">
          Toca el botón compartir <strong>⬆</strong> y luego <strong>"Agregar a pantalla de inicio"</strong>
        </p>
      </div>
      <button
        onClick={() => { setVisible(false); localStorage.setItem('pwa_hint_dismissed', '1'); }}
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border border-[var(--separator)] bg-[var(--glass-bg)] text-base-content/40 text-sm cursor-pointer"
      >
        ×
      </button>
    </div>
  )
}

export default IOSInstallHint
