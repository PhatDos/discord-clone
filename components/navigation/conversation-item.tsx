'use client'

import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ActionTooltip } from '../action-tooltip'

interface ConversationItemProps {
  unreadCount?: number
}

export const ConversationItem = ({
  unreadCount = 0
}: ConversationItemProps) => {
  const params = useParams()
  const router = useRouter()

  const isActive =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/conversations')

  const onClick = () => {
    router.push(`/conversations`)
  }

  return (
    <ActionTooltip side='right' align='center' label={'Your Direct Messages'}>
      <button onClick={onClick} className='group flex items-center relative'>
        {/* Active indicator bar */}
        <div
          className={cn(
            'absolute left-0 bg-white rounded-r-full transition-all w-[4px]',
            !isActive && 'group-hover:h-[20px]',
            isActive ? 'h-[36px]' : 'h-[8px]'
          )}
        />
        <div
          className={cn(
            'relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all',
            isActive && 'bg-primary/10 text-primary rounded-[16px]'
          )}
        >
          <div className='relative h-full w-full rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden'>
            <Image
              fill
              src='/favicon.ico'
              alt='Conversation'
              className='object-cover'
              // sizes="48px"
            />
          </div>
          {unreadCount > 0 && (
            <div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#1b1c2a] dark:border-[#1b1c2a]'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
      </button>
    </ActionTooltip>
  )
}
