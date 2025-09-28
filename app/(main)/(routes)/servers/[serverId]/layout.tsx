import { ServerSidebar } from "@/components/server/server-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { RedirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

interface ServerIdLayoutProps {
  children: React.ReactNode;
  params: {
    serverId: string;
  };
}

const ServerIdLayout = async ({ children, params }: ServerIdLayoutProps) => {
  const param = await Promise.resolve(params);
  const serverId = await param.serverId; // avoid warning

  const profile = await currentProfile();

  if (!profile) {
    return <RedirectToSignIn />;
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

  // return (
  //   <div className="flex h-full">
  //     <div className="md:flex-1 overflow-y-auto">
  //       <div className="hidden">
  //         <ServerSidebar serverId={serverId} />
  //       </div>
  //     </div>
  //     <div className="flex-1">{children}</div>
  //   </div>
  // );

  return (
    <div className="flex h-full">
      <div className="hidden md:!flex md:!flex-1 overflow-y-auto">
        <ServerSidebar serverId={serverId} />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default ServerIdLayout;
