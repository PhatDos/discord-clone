import { currentProfile } from "@/services/current-profile";
import { redirect } from "next/navigation";
import { ServerSidebarContent } from "./server-sidebar-content";

interface ServerSidebarProps {
  serverId: string;
  enableSocketListeners?: boolean;
}

export const ServerSidebar = async ({
  serverId,
  enableSocketListeners = true,
}: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/");
  }

  return (
    <ServerSidebarContent
      serverId={serverId}
      enableSocketListeners={enableSocketListeners}
    />
  );
};
