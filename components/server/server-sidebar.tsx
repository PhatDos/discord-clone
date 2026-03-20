import { currentProfile } from "@/services/current-profile";
import { redirect } from "next/navigation";
import { ServerSidebarContent } from "./server-sidebar-content";

interface ServerSidebarProps {
  serverId: string;
}

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/");
  }

  return <ServerSidebarContent serverId={serverId} />;
};
