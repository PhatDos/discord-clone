'use client'

import qs from 'query-string'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import * as React from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useModal } from '@/hooks/use-modal-store'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ChannelType } from '@prisma/client'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Channel name is required')
    .refine(name => name !== 'general', {
      message: "Channel name cannot be 'general'"
    }),
  type: z.nativeEnum(ChannelType)
})

export const EditChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal()
  const router = useRouter()
  const { toast } = useToast()
  const isModalOpen = isOpen && type === 'editChannel'
  const { channel, server } = data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: ChannelType.TEXT
    }
  })

  React.useEffect(() => {
    if (channel) {
      form.setValue('name', channel.name)
      form.setValue('type', channel.type)
    }
  }, [channel, form])
  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id
        }
      })
      await axios.patch(url, values)

      toast({
        title: 'Cập nhật kênh thành công',
        description: `Kênh "${values.name}" đã được cập nhật!`,
        variant: 'success'
      })

      form.reset()
      router.refresh()
      onClose()
    } catch {
      //console.error(error)
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật kênh. Vui lòng thử lại!',
        variant: 'destructive'
      })
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='bg-black text-white overflow-hidden'>
        <DialogHeader className='pt-8 px-6'>
          <DialogTitle className='text-2xl text-center font-bold'>
            Edit Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='spacef-y-8 px-6'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='uppercase pt-3 text-xs font-bold text-zinc-500 dark:text-secondary-500'>
                      Channel name
                    </FormLabel>
                    <FormControl className='pb-2'>
                      <Input
                        disabled={isLoading}
                        className='bg-zinc-300/50 border-2
                                                focus-visible:ring-0 text-white border-white
                                                focus-visible:ring-offset-0
                                                placeholder:italic placeholder:text-sm placeholder:text-zinc-500'
                        placeholder='Enter channel name'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='text-xs italic text-red-500' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem className='py-1'>
                    <FormLabel>Channel Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className='bg-zinc-300/50 border-0 focus:ring-0 ring-offset-0 
                                                    focus:ring-offset-0 capitalize
                                                    outline-none text-white '
                        >
                          <SelectValue placeholder='Select a channel type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-black'>
                        {Object.values(ChannelType).map(type => (
                          <SelectItem
                            key={type}
                            value={type}
                            className='capitalize bg-black text-white hover:cursor-pointer '
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className='px-6 py-2 flex justify-center'>
              <Button
                className='w-1/3 border-white border-2 hover:bg-gray-900 transition px-4 py-2 text-sm'
                disabled={isLoading}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
