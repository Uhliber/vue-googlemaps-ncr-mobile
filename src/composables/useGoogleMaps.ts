import { ref } from 'vue'

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-api'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

const state = ref<LoadState>('idle')
const loadError = ref<string | null>(null)

let resolveQueue: Array<() => void> = []
let rejectQueue: Array<(e: Error) => void> = []

function drainResolve() {
  resolveQueue.forEach((fn) => fn())
  resolveQueue = []
  rejectQueue = []
}

function drainReject(e: Error) {
  rejectQueue.forEach((fn) => fn(e))
  resolveQueue = []
  rejectQueue = []
}

export function useGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  function loadGoogleMaps(): Promise<void> {
    if (state.value === 'ready') return Promise.resolve()

    if (state.value === 'loading') {
      return new Promise((resolve, reject) => {
        resolveQueue.push(resolve)
        rejectQueue.push(reject)
      })
    }

    if (!apiKey || apiKey === 'YOUR_API_KEY') {
      const err = 'Google Maps API key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.'
      state.value = 'error'
      loadError.value = err
      return Promise.reject(new Error(err))
    }

    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      state.value = 'ready'
      return Promise.resolve()
    }

    state.value = 'loading'

    return new Promise((resolve, reject) => {
      resolveQueue.push(resolve)
      rejectQueue.push(reject)

      const callbackName = '__googleMapsInitCallback'
       
      ;(window as unknown as Record<string, unknown>)[callbackName] = () => {
        state.value = 'ready'
        drainResolve()
         
        delete (window as unknown as Record<string, unknown>)[callbackName]
      }

      const script = document.createElement('script')
      script.id = GOOGLE_MAPS_SCRIPT_ID
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = () => {
        state.value = 'error'
        const err = new Error('Failed to load Google Maps script. Check your API key and network.')
        loadError.value = err.message
        drainReject(err)
        document.getElementById(GOOGLE_MAPS_SCRIPT_ID)?.remove()
      }

      document.head.appendChild(script)
    })
  }

  return {
    loadGoogleMaps,
    mapsState: state,
    mapsError: loadError,
  }
}
