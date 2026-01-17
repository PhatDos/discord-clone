import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

const ConversationsPage = async () => {
  const profile = await currentProfile()

  if (!profile) {
    redirect("/sign-in")
  }

  // Lấy conversation đầu tiên để redirect
  const firstConversation = await db.conversation.findFirst({
    where: {
      OR: [{ profileOneId: profile.id }, { profileTwoId: profile.id }]
    },
    include: {
      profileOne: true,
      profileTwo: true
    }
  })

  if (!firstConversation) {
    return (
      <div className='flex items-center justify-center h-full'>
      </div>
    )
  }

  // Redirect to first conversation
  const otherProfile =
    firstConversation.profileOneId === profile.id
      ? firstConversation.profileTwo
      : firstConversation.profileOne

  return redirect(`/conversations/${otherProfile.id}`)
}

export default ConversationsPage
