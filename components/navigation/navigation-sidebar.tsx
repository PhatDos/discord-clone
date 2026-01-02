"use client";

import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/use-api-client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { NavigationAction } from "./navigation-action";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationItem } from "./navigation-item";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { ConversationItem } from "./conversation-item";
import { Loader2 } from "lucide-react";

interface Server {
  id: string;
  name: string;
  imageUrl: string;
}

export const NavigationSidebar = () => {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const apiClient = useApiClient();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/");
    }
  }, [userId, isLoaded, router]);

  const { data: servers, isLoading } = useQuery({
    queryKey: ["servers"],
    queryFn: () => apiClient.get<Server[]>("/servers"),
    enabled: !!userId,
  });

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 h-full w-[72px] text-primary
                dark:bg-[#1b1c2a] bg-[#e3e5e8] py-3 space-y-4 
                flex flex-col items-center"
    >
      <NavigationAction />
      <Separator className="h-[2px] bg-zinc-300 dark:bg-zinc-700 rounded-md mx-auto" />
      <ScrollArea className="flex-1 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center pt-4">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <>
            <div className="pt-1 mb-3">
              <ConversationItem />
            </div>
            {servers?.map((server) => (
              <div key={server.id} className="pt-1 mb-3">
                <NavigationItem
                  id={server.id}
                  name={server.name}
                  imageUrl={server.imageUrl}
                  unreadCount={0}
                />
              </div>
            ))}
          </>
        )}
      </ScrollArea>
      <div className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-[48px] w-[48px]",
            },
          }}
        />
      </div>
    </div>
  );
};
