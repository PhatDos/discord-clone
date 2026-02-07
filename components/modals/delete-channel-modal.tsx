'use client'

import { AxiosError } from 'axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useModal } from '@/hooks/use-modal-store'
import { Button } from '../ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useApiClient } from '@/hooks/use-api-client'

export const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()
  const { toast } = useToast()
  const api = useApiClient()
  const isModalOpen = isOpen && type === 'deleteChannel'
  const { server, channel } = data
  const [isLoading, setIsLoading] = useState(false)
  const onClick = async () => {
    try {
      setIsLoading(true)
      await api.delete(`/channels/${channel?.id}`)

      toast({
        title: 'Channel deleted',
        description: `Channel "${channel?.name}" has been deleted!`,
        variant: 'success'
      })

      onClose()
      router.push(`/servers/${server?.id}`)
      router.refresh()
    } catch (error) {
      const err = error as AxiosError<{ message: string }>
      console.error(err)
      toast({
        title: 'Error',
        description:
          err.response?.data?.message ??
          'Failed to delete channel. Please try again!',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className='bg-black text-white overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'></DialogTitle>
          <DialogDescription className='text-center text-zinc-500'>
            Are u sure u want to delete this channel? Are you really want to do
            this? <br />
            <span className='font-semibold text-green-700'>
              #{channel?.name}
            </span>{' '}
            will be gone forever. <br />
            it all returns to nothing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='px-6 py-1'>
          <div className='flex items-center justify-between w-full'>
            <Button disabled={isLoading} onClick={onClose} variant='ghost'>
              Cancel
            </Button>
            <Button disabled={isLoading} variant='default' onClick={onClick}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
