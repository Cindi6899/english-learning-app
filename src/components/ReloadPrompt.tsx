import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setNeedRefresh(false)
  }

  return (
    <div className="ReloadPrompt-container">
      { (needRefresh) && (
        <div className="fixed bottom-0 right-0 m-6 p-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Update available</h3>
            <p className="text-gray-600">New content is available, click on reload button to update.</p>
          </div>
          <div className="flex justify-end gap-3">
             <button 
               className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
               onClick={() => close()}
             >
               Close
             </button>
             <button 
               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
               onClick={() => updateServiceWorker(true)}
             >
               Reload
             </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReloadPrompt