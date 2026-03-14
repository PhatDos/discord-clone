import { currentProfile } from '@/services/current-profile'
import { getConversationsList } from '@/services/conversation-service'
import { redirect } from 'next/navigation'
import { ConversationSidebar } from '@/components/server/conversation-sidebar'

interface ConversationLayoutProps {
  children: React.ReactNode
}

const ConversationLayout = async ({ children }: ConversationLayoutProps) => {
  const profile = await currentProfile()

  if (!profile) {
    return redirect('/sign-in')
  }

  const conversations = await getConversationsList()

  return (
    <div className='flex h-full'>
      <div className='hidden md:!flex md:!flex-1 overflow-y-auto'>
        <ConversationSidebar
          conversations={conversations}
          currentProfileId={profile.id}
        />
      </div>
      <div className='flex-[2]'>{children}</div>
    </div>
  )
}

export default ConversationLayout
