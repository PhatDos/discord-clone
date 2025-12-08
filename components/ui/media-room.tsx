"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
}

export const MediaRoom = ({ chatId, video, audio }: MediaRoomProps) => {
  const { user, isLoaded } = useUser();
  const [ token, setToken ] = useState("");
  console.log("isLoaded:", isLoaded);
  console.log("user:", user);
  console.log("user.firstName:", user?.firstName);
  console.log("user.lastName:", user?.lastName);
  useEffect(() => {
    console.log("useeffect triggered");

    if (!isLoaded || !user) {
      console.log("User not loaded");
      return;
    }

    const name = `${user.firstName ?? "Unknown"} ${user.lastName ?? "User"} `;
    console.log("Calling api with name: ", name);

    (async () => {
      try {
        const resp = await fetch(
          `/api/livekit?room=${chatId}&username=${name}`,
        );
        const data = await resp.json();
        if (!data?.token) {
          console.log("No token found in response:", data);
          return;
        }
        console.log("Token response object:", data);
        console.log("typeof token:", typeof data.token);
        setToken(data.token);
        console.log("Token received:", data.token);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [ isLoaded, user, chatId ]);

  if (!isLoaded || token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />\
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Loading room...
        </p>
      </div>
    );
  }
  console.log("serverUrl:", process.env.NEXT_PUBLIC_LIVEKIT_URL);

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};
