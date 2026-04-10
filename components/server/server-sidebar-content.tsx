'use client';

import React from "react";
import { Loader2, ServerCrash } from "lucide-react";
import { useServerSidebarQuery } from "@/hooks/use-server-sidebar-query";
import { useServerSidebarRefresh } from "@/hooks/use-server-sidebar-refresh";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerMember } from "./server-member";
import { ServerSidebarUnread } from "./server-sidebar-unread";
import { Hash, Mic, Video, ShieldAlert, ShieldCheck } from "lucide-react";
import { MemberRole } from "@/types/api/member";
import { Separator } from "../ui/separator";

export enum ChannelType {
  TEXT = "TEXT",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

const iconMap = {
  [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
  [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
  [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />,
};

const roleIconMap = {
  [MemberRole.GUEST]: null,
  [MemberRole.VICESERVEROWNER]: (
    <ShieldCheck className="h-4 w-4 mr-2 text-indigo-500" />
  ),
  [MemberRole.SERVEROWNER]: (
    <ShieldAlert className="h-4 w-4 mr-2 text-rose-500" />
  ),
};

interface ServerSidebarContentProps {
  serverId: string;
  enableSocketListeners?: boolean;
}

export const ServerSidebarContent = ({
  serverId,
  enableSocketListeners = true,
}: ServerSidebarContentProps) => {
  const { data, isLoading, isError } = useServerSidebarQuery({ serverId });

  // Listen to socket event and invalidate query
  useServerSidebarRefresh({ serverId, enableSocketListeners });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full flex-1 text-primary dark:bg-[#2B2D31] bg-[#f2f3f5] items-center justify-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (isError || !data || !data.server) {
    return (
      <div className="flex flex-col h-full flex-1 text-primary dark:bg-[#2B2D31] bg-[#f2f3f5] items-center justify-center">
        <ServerCrash className="h-10 w-10 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Failed to load server
        </p>
      </div>
    );
  }

  const { server, textChannels, audioChannels, videoChannels, members, role } =
    data;

  return (
    <div className="flex flex-col h-full flex-1 text-primary dark:bg-[#2B2D31] bg-[#f2f3f5]">
      <ServerHeader server={server} role={role} />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2 ">
          <ServerSearch
            data={[
              {
                label: "Text Channels",
                type: "channel",
                data: textChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Voice Channels",
                type: "channel",
                data: audioChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Video Channels",
                type: "channel",
                data: videoChannels?.map((channel) => ({
                  id: channel.id,
                  name: channel.name,
                  icon: iconMap[channel.type],
                })),
              },
              {
                label: "Members",
                type: "member",
                data: members?.map((member) => ({
                  id: member.id,
                  name: member.profile.name,
                  icon: roleIconMap[member.role],
                })),
              },
            ]}
          />
        </div>
        <Separator className="!w-full bg-zinc-500 dark:bg-zinc-700 rounded-md my-2" />
        {!!textChannels?.length && (
          <div className="mb-2">
            <ServerSection
              sectionType="channels"
              channelType={ChannelType.TEXT}
              role={role}
              label="Text Channels"
            />
            <ServerSidebarUnread
              textChannels={textChannels}
              server={server}
              role={role}
              enableSocketListeners={enableSocketListeners}
            />
          </div>
        )}
        <div className="space-y-[2px]">
          {!!audioChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.AUDIO}
                role={role}
                label="Voice Channels"
              />
              {audioChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-[2px]">
          {!!videoChannels?.length && (
            <div className="mb-2">
              <ServerSection
                sectionType="channels"
                channelType={ChannelType.VIDEO}
                role={role}
                label="Video Channels"
              />
              {videoChannels.map((channel) => (
                <ServerChannel
                  key={channel.id}
                  channel={channel}
                  role={role}
                  server={server}
                />
              ))}
            </div>
          )}
        </div>
        <div className="space-y-[2px]">
          <div className="mb-2">
            <ServerSection
              sectionType="members"
              role={role}
              label="Members"
              server={server}
            />
            {!!members?.length ? (
              members.map((member) => (
                <ServerMember key={member.id} member={member} />
              ))
            ) : (
              <div className="text-center text-zinc-500 dark:text-zinc-400 text-sm italic">
                You are currently the only member here
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
