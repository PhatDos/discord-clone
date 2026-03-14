import { currentProfile } from '@/services/current-profile'
import { redirect } from 'next/navigation'
import { getInitialConversation } from '@/services/conversation-service'

const ConversationsPage = async () => {
  const profile = await currentProfile()

  if (!profile) {
    redirect("/sign-in")
  }

  // Gọi API BE để lấy cuộc trò chuyện đầu tiên
  const data = await getInitialConversation()

  if (!data || !data.conversation || !data.otherProfile) {
    return (
      <div className='flex items-center justify-center h-full'>
      </div>
    )
  }

  return redirect(`/conversations/${data.otherProfile.id}`)
}

export default ConversationsPage
