"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/common/user-avatar";

import { composeLocalPost } from "./mock-feed-source";
import { FeedAuthor, FeedPost } from "./types";

interface CreatePostBoxProps {
  author: FeedAuthor;
  onCreated: (post: FeedPost) => void;
}

export const CreatePostBox = ({ author, onCreated }: CreatePostBoxProps) => {
  const [content, setContent] = useState("");

  const isDisabled = useMemo(() => content.trim().length === 0, [content]);

  const handleSubmit = () => {
    if (isDisabled) {
      return;
    }

    const post = composeLocalPost({ content, author });
    onCreated(post);
    setContent("");
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-700/70 bg-white/95 dark:bg-[#2b2d31]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <UserAvatar src={author.imageUrl} className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/40 p-3 text-sm resize-none outline-none focus-visible:ring-2 ring-offset-0 ring-indigo-500/50"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Share a short update with your followers.
              </p>
              <Button type="button" onClick={handleSubmit} disabled={isDisabled}>
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};