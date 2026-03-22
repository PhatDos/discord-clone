import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '../ui/button'
import { NavigationSidebar } from '../navigation/navigation-sidebar'
import { ConversationSidebar } from '../server/conversation-sidebar'
import { ConversationWithProfiles } from '@/types/api/message'

interface ConversationMobileToggleProps {
  conversations: ConversationWithProfiles[]
  currentProfileId: string
}

export const ConversationMobileToggle = ({
  conversations,
  currentProfileId
}: ConversationMobileToggleProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='md:hidden'>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='p-0 flex flex-row gap-0'>
        <div className='w-[72px]'>
          <NavigationSidebar enableSocketListeners={false} />
        </div>
        <ConversationSidebar
          conversations={conversations}
          currentProfileId={currentProfileId}
        />
      </SheetContent>
    </Sheet>
  )
}
