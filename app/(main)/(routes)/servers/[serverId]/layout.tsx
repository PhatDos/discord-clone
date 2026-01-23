import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

interface ServerIdLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    serverId: string;
  }>;
}

const ServerIdLayout = async ({ children, params }: ServerIdLayoutProps) => {
  const { serverId } = await params;

  const profile = await currentProfile();

  if (!profile) {
    return redirect("/sign-in");
  }

  const server = await db.server.findFirst({
    where: {
      id: serverId,
      members: {
        some: {
          profileId: profile.id,
        },
      },
    },
  });

  if (!server) {
    return redirect("/");
  }

  return (
    <div className="flex h-full">
      <div className="hidden md:!flex md:!flex-1 overflow-y-auto">
        <ServerSidebar serverId={serverId} />
      </div>
      <div className="flex-[2]">{children}</div>
    </div>
  );
};

export default ServerIdLayout;
