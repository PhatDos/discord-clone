"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/hooks/use-api-client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSocket } from "@/components/providers/socket-provider";

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
  unreadCount?: number;
}

interface ServerResponse {
  data: Server[];
  total: number;
  skip: number;
  limit: number;
  totalPages: number;
}

export const NavigationSidebar = () => {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const apiClient = useApiClient();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/");
    }
  }, [userId, isLoaded, router]);

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["servers"],
      queryFn: ({ pageParam = 0 }) => {
        const skip = pageParam * 7;
        const limit = 7;
        return apiClient.get<ServerResponse>(
          `/servers?skip=${skip}&limit=${limit}`
        );
      },
      getNextPageParam: (lastPage) => {
        if (lastPage.skip + lastPage.limit < lastPage.total) {
          return Math.floor(lastPage.skip / 7) + 1;
        }
        return undefined;
      },
      enabled: !!userId,
    });

  const servers = data?.pages.flatMap((p) => p.data) ?? [];

  // Intersection Observer để detect khi scroll đến cuối
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Listen server unread updates
  useEffect(() => {
    if (!socket) return;

    const handler = ({
      serverId,
      totalUnread,
    }: {
      serverId: string;
      totalUnread: number;
    }) => {
      queryClient.setQueryData(["servers"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((server: Server) =>
              server.id === serverId
                ? { ...server, unreadCount: totalUnread }
                : server
            ),
          })),
        };
      });
    };

    socket.on("server:unread-update", handler);
    return () => {
      socket.off("server:unread-update", handler);
    };
  }, [socket, queryClient]);

  // Listen channel notifications (new message)
  useEffect(() => {
    if (!socket) return;

    const handler = ({ serverId, inc }: { serverId: string; inc: number }) => {
      queryClient.setQueryData(["servers"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((server: Server) =>
              server.id === serverId
                ? {
                    ...server,
                    unreadCount: (server.unreadCount ?? 0) + inc,
                  }
                : server
            ),
          })),
        };
      });

      console.log("🔔 channel:notification", { serverId, inc });
    };

    socket.on("channel:notification", handler);
    return () => {
      socket.off("channel:notification", handler);
    };
  }, [socket, queryClient]);

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
      <ScrollArea className="flex-1 w-full overflow-y-auto">
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
                  unreadCount={server.unreadCount}
                />
              </div>
            ))}
            {/* Load more trigger */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="flex justify-center py-4">
                {isFetchingNextPage && (
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                )}
              </div>
            )}
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
