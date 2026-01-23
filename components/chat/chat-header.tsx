import { Hash } from 'lucide-react'
import { MobileToggle } from '../common/mobile-toggle'
import { ConversationMobileToggle } from '../common/conversation-mobile-toggle'
import { UserAvatar } from '../common/user-avatar'
import { SocketIndicator } from '../common/socket-indicator'
import { ChatVideoButton } from './chat-video-button'
import { Conversation, Profile } from '@prisma/client'

interface ConversationWithProfiles extends Conversation {
  profileOne: Profile
  profileTwo: Profile
}

interface ChatHeaderProps {
  serverId?: string
  name: string
  type: 'channel' | 'conversation'
  imageUrl?: string
  conversations?: ConversationWithProfiles[]
  currentProfileId?: string
}
export const ChatHeader = ({
  serverId,
  name,
  type,
  imageUrl,
  conversations,
  currentProfileId
}: ChatHeaderProps) => {
  return (
    <div
      className='text-md font-semibold px-3 flex items-center h-12
        border-neutral-200 dark:border-gray-500 border-b-2'
    >
      {serverId && <MobileToggle serverId={serverId} />}
      {type === 'conversation' && conversations && currentProfileId && (
        <ConversationMobileToggle
          conversations={conversations}
          currentProfileId={currentProfileId}
        />
      )}
      {type === 'channel' && (
        <Hash className='w-5 h-4 text-zinc-500 dark:text-zinc-400 mr-2' />
      )}
      {type === 'conversation' && (
        <UserAvatar src={imageUrl} className='h-8 w-8 md:h-8 md:w-8 mr-2' />
      )}
      <p className='font-semibold text-md text-black dark:text-white'>{name}</p>
      <div className='ml-auto flex items-center'>
        {type === 'conversation' && <ChatVideoButton />}
        <SocketIndicator />
      </div>
    </div>
  )
}
