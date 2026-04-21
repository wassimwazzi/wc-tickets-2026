import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastContextType {
  toast: (opts: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      toast: (opts: Omit<Toast, 'id'>) => {
        console.log('Toast:', opts.title)
      }
    }
  }
  return ctx
}

let toastFn: ((opts: Omit<Toast, 'id'>) => void) | null = null

export function toast(opts: Omit<Toast, 'id'>) {
  if (toastFn) toastFn(opts)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...opts, id }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    toastFn = addToast
    return () => { toastFn = null }
  }, [addToast])

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn(
            'rounded-lg border p-4 shadow-lg bg-white flex items-start gap-3',
            t.variant === 'destructive' && 'bg-red-50 border-red-200'
          )}
        >
          <div className="flex-1">
            <p className="font-semibold text-sm">{t.title}</p>
            {t.description && <p className="text-sm text-gray-600 mt-0.5">{t.description}</p>}
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
