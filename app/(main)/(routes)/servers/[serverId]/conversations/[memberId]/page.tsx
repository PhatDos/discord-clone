import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessages } from "@/components/chat/chat-messages";
import { MediaRoom } from "@/components/ui/media-room";
import { getOrCreateConversation } from "@/lib/conversation";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface MemberIdPageProps {
  params: {
    memberId: string;
    serverId: string;
  };
  searchParams?: {
    video?: boolean;
  };
}

const MemberIdPage = async ({ params, searchParams }: MemberIdPageProps) => {
  const profile = await currentProfile();
  const { serverId, memberId } = params;
  const video = searchParams?.video;

  if (!profile) {
    return <RedirectToSignIn />;
  }

  const currentMember = await db.member.findFirst({
    where: {
      serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) {
    return redirect("/");
  }

  const conversation = await getOrCreateConversation(
    currentMember.id,
    memberId,
  );

  if (!conversation) {
    return redirect(`/servers/${serverId}`);
  }

  // Sửa destructure theo Prisma include
  const { profileOne, profileTwo } = conversation;
  const otherMember = profileOne.id === profile.id ? profileTwo : profileOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imageUrl={otherMember.imageUrl}
        name={otherMember.name}
        serverId={serverId}
        type="conversation"
      />
      {video ? (
        <MediaRoom chatId={conversation.id} video={true} audio={true} />
      ) : (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl={process.env.NEXT_PUBLIC_SITE_URL!}
            socketQuery={{ conversationId: conversation.id }}
          />
          <ChatInput
            name={otherMember.name}
            type="conversation"
            apiUrl={process.env.NEXT_PUBLIC_SITE_URL!}
            query={{
              conversationId: conversation.id,
              memberId: currentMember.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default MemberIdPage;
