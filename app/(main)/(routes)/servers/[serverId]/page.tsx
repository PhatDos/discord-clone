import { currentProfile } from "@/services/current-profile";
import { getInitialChannel } from "@/services/servers/servers-ssr-service";
import { redirect } from "next/navigation";

interface ServerIdPageProps {
  params: Promise<{
    serverId: string;
  }>;
}

const ServerIdPage = async ({ params }: ServerIdPageProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const { serverId } = await params;

  const channelData = await getInitialChannel(serverId);

  if (!channelData) {
    return null;
  }

  return redirect(`/servers/${serverId}/channels/${channelData.channelId}`);
};

export default ServerIdPage;
