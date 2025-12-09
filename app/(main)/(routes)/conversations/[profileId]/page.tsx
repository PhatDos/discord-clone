import { ChatHeader } from '@/components/chat/chat-header'
import { DirectChatInput } from '@/components/chat/direct-chat/direct-chat-input'
import { DirectChatMessages } from '@/components/chat/direct-chat/direct-chat-messages'
import { MediaRoom } from '@/components/ui/media-room'
import { getOrCreateConversation } from '@/lib/conversation'
import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { RedirectToSignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

interface ProfileIdPageProps {
  params: Promise<{ profileId: string }>
  searchParams?: Promise<{ video?: string }>
}

const ProfileIdPage = async ({ params, searchParams }: ProfileIdPageProps) => {
  const profile = await currentProfile()
  const { profileId } = await params
  const searchParamsData = await searchParams
  const video = searchParamsData?.video

  if (!profile) return <RedirectToSignIn />

  // Lấy profile đang chat
  const otherProfile = await db.profile.findUnique({
    where: { id: profileId }
  })

  if (!otherProfile) return redirect(`/conversations`)

  const conversation = await getOrCreateConversation(
    profile.id,
    otherProfile.id
  )
  if (!conversation) return redirect(`/conversations`)

  // Lấy danh sách conversations cho mobile toggle
  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ profileOneId: profile.id }, { profileTwoId: profile.id }]
    },
    include: {
      profileOne: true,
      profileTwo: true,
      directMessages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  return (
    <div className='bg-white dark:bg-[#313338] flex flex-col h-full'>
      <ChatHeader
        imageUrl={otherProfile.imageUrl}
        name={otherProfile.name}
        type='conversation'
        conversations={conversations}
        currentProfileId={profile.id}
      />
      {video ? (
        <MediaRoom chatId={conversation.id} video audio />
      ) : (
        <>
          <DirectChatMessages
            profile={profile}
            name={otherProfile.name}
            chatId={conversation.id}
            apiUrl='/api/direct-messages'
            socketQuery={{
              conversationId: conversation.id,
              memberId: profile.id
            }}
          />
          <DirectChatInput
            name={otherProfile.name}
            apiUrl={process.env.NEXT_PUBLIC_SITE_URL!}
            query={{
              conversationId: conversation.id,
              memberId: profile.id
            }}
          />
        </>
      )}
    </div>
  )
}

export default ProfileIdPage
