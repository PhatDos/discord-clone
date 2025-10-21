'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircle, Video, Phone, Users } from 'lucide-react'

import BlurText from '../animation/blur-text'
import { Card } from '@/components/ui/card'

export function Hero() {
  const router = useRouter()

  return (
    <section className='relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-white dark:bg-black transition-colors'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-r from-white/5 to-blue-500/10 dark:from-black/5 dark:to-purple-700/20 pointer-events-none' />

      <div className='container relative mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 mb-8'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-blue-500 dark:bg-purple-500'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500 dark:bg-purple-500'></span>
            </span>
            <span className='text-sm text-blue-500 dark:text-purple-500'>
              <BlurText
                text='Real-time communication platform'
                delay={150}
                animateBy='words'
                direction='top'
              />
            </span>
          </div>

          {/* Heading */}
          <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-black dark:text-white'>
            Connect instantly with{' '}
            <span className='text-blue-500 dark:text-purple-500'>
              voice, video & chat
            </span>
          </h1>

          {/* Subtext */}
          <p className='text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed'>
            Experience seamless real-time messaging with crystal-clear voice and
            video calls. Built for teams and individuals who value instant
            communication.
          </p>

          {/* Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4 mb-16'>
            <Button
              size='lg'
              className='bg-blue-500 dark:bg-purple-500 text-white hover:bg-blue-600 dark:hover:bg-purple-600 text-base px-8 h-12'
              onClick={() => router.push('/setup')}
            >
              Start Chatting Free
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </div>

          {/* Features Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto'>
            {[
              {
                icon: MessageCircle,
                title: 'Instant Messaging',
                desc: 'Real-time chat with typing indicators'
              },
              {
                icon: Video,
                title: 'Video Calls',
                desc: 'HD video conferencing for teams'
              },
              {
                icon: Phone,
                title: 'Voice Calls',
                desc: 'Crystal-clear audio quality'
              }
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className='flex flex-col items-center gap-3 p-6 rounded-xl bg-transparent border border-gray-200 dark:border-gray-700
                        hover:bg-gradient-to-tr hover:from-blue-50 hover:to-cyan-100 dark:hover:from-purple-800 dark:hover:to-pink-700 transition-colors'
              >
                <div className='p-3 rounded-lg bg-blue-100 dark:bg-purple-700/20'>
                  <Icon className='h-6 w-6 text-blue-500 dark:text-purple-500' />
                </div>
                <h3 className='font-semibold text-black dark:text-white'>
                  {title}
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-300 text-center'>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='mt-20 relative w-[90vw] mx-auto'>
        <div
          className='absolute inset-0 bg-gradient-to-t 
                from-pink-50 dark:from-purple-900 
                via-transparent to-transparent z-10 rounded-xl'
        ></div>
        <Card className='overflow-hidden shadow-2xl border-slate-200 dark:border-slate-800'>
          <div className='bg-gradient-to-br from-slate-900 to-slate-800 p-4'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-3 h-3 rounded-full bg-red-500'></div>
              <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
              <div className='w-3 h-3 rounded-full bg-green-500'></div>
            </div>
            <div className='bg-slate-950 rounded-lg p-8 aspect-video flex items-center justify-center'>
              <div className='grid grid-cols-2 gap-4 w-full max-w-4xl'>
                <div className='bg-slate-800 rounded-lg aspect-video flex items-center justify-center'>
                  <Video className='w-12 h-12 text-blue-400' />
                </div>
                <div className='bg-slate-800 rounded-lg aspect-video flex items-center justify-center'>
                  <Users className='w-12 h-12 text-green-400' />
                </div>
                <div className='bg-slate-800 rounded-lg aspect-video flex items-center justify-center'>
                  <MessageCircle className='w-12 h-12 text-orange-400' />
                </div>
                <div className='bg-slate-800 rounded-lg aspect-video flex items-center justify-center'>
                  <Phone className='w-12 h-12 text-cyan-400' />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
