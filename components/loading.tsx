import { Loader2 } from 'lucide-react'

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-[#cc707033] animate-ping"></div>
        
        {/* Middle ring */}
        <div className="absolute inset-2 rounded-full border-4 border-[var(--primary-accent)] opacity-50 animate-spin"></div>
        
        {/* Inner spinner */}
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        
        {/* Loading text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          <p className="text-white font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    </div>
  )
}
