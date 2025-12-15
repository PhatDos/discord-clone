import { ChatHeader } from "@/components/chat/chat-header";
import { ChannelChatInput } from "@/components/chat/channel-chat/channel-chat-input";
import { ChannelChatMessages } from "@/components/chat/channel-chat/channel-chat-messages";
import { MediaRoom } from "@/components/ui/media-room";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

interface ChannelIdPageProps {
  params: Promise<{
    serverId: string;
    channelId: string;
  }>;
}

const ChannelIdPage = async ({ params }: ChannelIdPageProps) => {
  const { serverId, channelId } = await params;

  const profile = await currentProfile();

  if (!profile) {
    return <RedirectToSignIn />;
  }

  const channel = await db.channel.findUnique({
    where: { id: channelId },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) {
    redirect("/");
  }

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />

      {channel.type === ChannelType.TEXT && (
        <>
          <ChannelChatMessages
            member={member}
            name={channel.name}
            chatId={channel.id}
            apiUrl="/api/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
          />
          <ChannelChatInput
            name={channel.name}
            query={{
              channelId: channel.id,
              serverId: channel.serverId,
            }}
          />
        </>
      )}

      {channel.type === ChannelType.AUDIO && (
        <MediaRoom chatId={channel.id} video={false} audio={true} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom chatId={channel.id} video={true} audio={true} />
      )}
    </div>
  );
};

export default ChannelIdPage;
