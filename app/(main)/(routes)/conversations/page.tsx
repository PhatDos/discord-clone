import { currentProfile } from '@/lib/current-profile'
import { db } from '@/lib/db'
import { RedirectToSignIn } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

const ConversationsPage = async () => {
  const profile = await currentProfile()

  if (!profile) {
    return <RedirectToSignIn />
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
        <div className='text-center'>
          <h2 className='text-2xl font-semibold mb-2'>No conversations yet</h2>
          <p className='text-zinc-500 dark:text-zinc-400'>
            Start a conversation with someone from a server
          </p>
        </div>
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
