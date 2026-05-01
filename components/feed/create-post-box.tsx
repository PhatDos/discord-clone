"use client";

import { useMemo, useState } from "react";

import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiClient } from "@/hooks/use-api-client";
import { useToast } from "@/hooks/use-toast";

import { createPost } from "@/services/posts-client-service";

import { FeedAuthor, FeedPost } from "./types";

interface CreatePostBoxProps {
  author: FeedAuthor;
  onCreated: (post: FeedPost) => void;
}

export const CreatePostBox = ({ author, onCreated }: CreatePostBoxProps) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "FRIENDS" | "PRIVATE">("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const api = useApiClient();
  const { toast } = useToast();

  const isDisabled = useMemo(() => content.trim().length === 0, [content]);

  const handleSubmit = async () => {
    if (isDisabled || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const post = await createPost(api, {
        content: content.trim(),
        fileType: "text",
        visibility,
      });

      onCreated(post);
      setContent("");
    } catch {
      toast({
        title: "Cannot create post",
        description: "Failed to publish this post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-700/70 bg-white/95 dark:bg-[#2b2d31]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <UserAvatar
            src={author.imageUrl}
            className="h-10 w-10"
          />
          <div className="flex-1 space-y-2">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-28 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-900/40 p-3 text-sm resize-none outline-none focus-visible:ring-2 ring-offset-0 ring-indigo-500/50"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Select value={visibility} onValueChange={(value: "PUBLIC" | "FRIENDS" | "PRIVATE") => setVisibility(value)}>
                  <SelectTrigger className="w-[110px] h-8 text-xs bg-zinc-100 dark:bg-zinc-800 border-transparent focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#2b2d31]">
                    <SelectItem value="PUBLIC" className="cursor-pointer">Public</SelectItem>
                    <SelectItem value="FRIENDS" className="cursor-pointer">Friends</SelectItem>
                    <SelectItem value="PRIVATE" className="cursor-pointer">Private</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Share a short update.
                </p>
              </div>
              <Button type="button" onClick={() => void handleSubmit()} disabled={isDisabled || isSubmitting}>
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};