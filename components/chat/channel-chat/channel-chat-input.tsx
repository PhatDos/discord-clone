'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem } from '../../ui/form'
import { Plus, Send } from 'lucide-react'
import { Input } from '../../ui/input'
import { useModal } from '@/hooks/use-modal-store'
import { EmojiPicker } from '../../common/emoji-picker'
import { useSocket } from '@/components/providers/socket-provider'
import { useAuth } from '@clerk/nextjs'
import { useQueryClient, InfiniteData } from '@tanstack/react-query'

import { ChatMessageResponse, OptimisticMessage } from '@/types'

interface ChannelChatInputProps {
  query: { channelId: string; serverId: string }
  name: string
}

const formSchema = z.object({
  content: z.string().min(1)
})

export const ChannelChatInput = ({
  name,
  query
}: ChannelChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { onOpen } = useModal()
  const { socket } = useSocket()
  const { userId } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = `chat:${query.channelId}`

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: ''
    }
  })

  const isLoading = form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!socket || !userId) return

    const tempId = crypto.randomUUID()

    // tạo message tạm
    const optimisticMessage: OptimisticMessage = {
      id: tempId,
      content: values.content,
      member: {
        id: 'temp',
        profile: {
          userId,
          name: 'You',
          imageUrl: '', // avatar hiện tại
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      deleted: false,
      status: "sending",
      isOptimistic: true,
    }

    // insert ngay vào cache của Tanstack query
    queryClient.setQueryData<InfiniteData<ChatMessageResponse>>([ queryKey ], (oldData) => {
      if (!oldData) return oldData
      console.log(oldData)
      return {
        ...oldData,
        pages: oldData.pages.map((page, i: number) =>
          i === 0
            ? { ...page, items: [ optimisticMessage, ...page.items ] }
            : page
        ),
      }
    })

    socket.emit('channel:message:create', {
      tempId,  //
      content: values.content,
      channelId: query.channelId,
      memberId: userId,
    })

    form.reset()
    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='content'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='relative p-4 pb-6'>
                  <button
                    type='button'
                    onClick={() =>
                      onOpen('messageFile', {
                        query: {
                          chatType: 'channel',
                          channelId: query.channelId,
                          serverId: query.serverId,
                          memberId: userId
                        }
                      })
                    }
                    className='absolute top-7 left-8 h-[24px] w-[24px]
                    bg-zinc-500 dark:bg-zinc-400 hover:bg-zinc-600
                    dark:hover:bg-zinc-300 transition rounded-full p-1
                    flex items-center justify-center'
                  >
                    <Plus className='text-white dark:text-[#313338]' />
                  </button>

                  <Input
                    disabled={isLoading}
                    className='px-14 py-6 bg-zinc-200/90
                                        dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0
                                        focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-300'
                    placeholder={`Message #${name}`}
                    {...field}
                    ref={inputRef}
                  />
                  <div className='absolute flex top-7 right-8 gap-2'>
                    <EmojiPicker
                      onChange={(emoji: string) =>
                        field.onChange(`${field.value} ${emoji}`)
                      }
                    />
                    <button
                      type='button'
                      onClick={() => form.handleSubmit(onSubmit)()}
                      disabled={isLoading}
                      className='flex items-center justify-center'
                      aria-label='Send message'
                    >
                      <Send
                        className='text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition'
                        size={24}
                      />
                    </button>
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
