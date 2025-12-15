'use client'

import { Conversation, Profile } from '@prisma/client'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { useParams, useRouter } from 'next/navigation'
import { UserAvatar } from '../user-avatar'
import { cn } from '@/lib/utils'

interface ConversationWithProfiles extends Conversation {
  profileOne: Profile
  profileTwo: Profile
}

interface ConversationSidebarProps {
  conversations: ConversationWithProfiles[]
  currentProfileId: string
}

export const ConversationSidebar = ({
  conversations,
  currentProfileId
}: ConversationSidebarProps) => {
  const router = useRouter()
  const params = useParams()

  return (
    <div className='flex flex-col h-full flex-1 text-primary dark:bg-[#2B2D31] bg-[#f2f3f5]'>
      <div className='px-3 py-4 border-b border-zinc-200 dark:border-zinc-700'>
        <h2 className='text-lg font-semibold'>Direct Messages</h2>
      </div>
      <ScrollArea className='flex-1 px-3'>
        <div className='space-y-[2px] mt-2'>
          {conversations.length > 0 ? (
            conversations.map(conversation => {
              const otherProfile =
                conversation.profileOneId === currentProfileId
                  ? conversation.profileTwo
                  : conversation.profileOne

              const isActive = params?.profileId === otherProfile.id

              return (
                <button
                  key={conversation.id}
                  onClick={() =>
                    router.push(`/conversations/${otherProfile.id}`)
                  }
                  className={cn(
                    'group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition mb-1',
                    isActive && 'bg-zinc-700/50 dark:bg-zinc-700'
                  )}
                >
                  <UserAvatar
                    src={otherProfile.imageUrl}
                    className='h-8 w-8 md:h-8 md:w-8'
                  />
                  <p
                    className={cn(
                      'font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition',
                      isActive &&
                        'text-primary dark:text-zinc-200 dark:group-hover:text-white'
                    )}
                  >
                    {otherProfile.name}
                  </p>
                </button>
              )
            })
          ) : (
            <div className='text-center text-zinc-500 dark:text-zinc-400 text-sm italic py-4'>
              No conversations yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
