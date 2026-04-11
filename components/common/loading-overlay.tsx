'use client'

import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
}

export const LoadingOverlay = ({ isLoading, text = 'Loading...' }: LoadingOverlayProps) => {
  if (!isLoading) return null

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <Loader2 className='w-12 h-12 animate-spin text-white' />
        <p className='text-white text-sm font-medium'>{text}</p>
      </div>
    </div>
  )
}
