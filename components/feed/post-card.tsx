"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Globe, Heart, Lock, MessageCircle, Trash2, Users } from "lucide-react";

import { ProfileHoverCard } from "@/components/common/profile-hover-card";
import { UserAvatar } from "@/components/common/user-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { FeedPost } from "./types";
import { PostComments } from "./post-comments";

interface PostCardProps {
  post: FeedPost;
  onLike: (postId: string, isLiked: boolean) => void;
  currentUserId: string;
  onDelete: (postId: string) => void;
  isDeleting?: boolean;
  onCommentAdded?: (postId: string) => void;
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleString();
};

export const PostCard = ({ post, onLike, currentUserId, onDelete, isDeleting = false, onCommentAdded }: PostCardProps) => {
  const [showComments, setShowComments] = useState(Boolean(post.comments?.length));
  const canDelete = post.author.id === currentUserId;

  return (
    <Card className="border-zinc-200 dark:border-zinc-700/70 bg-white/95 dark:bg-[#2b2d31]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          {post.author.id === currentUserId ? (
            <UserAvatar src={post.author.imageUrl} className="h-9 w-9" />
          ) : (
            <ProfileHoverCard
              id={post.author.id ?? ""}
              name={post.author.name}
              imageUrl={post.author.imageUrl}
              className="h-9 w-9"
            />
          )}
          <div>
            <p className="text-sm font-semibold">{post.author.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <p>{formatDate(post.createdAt)}</p>
              <span>•</span>
              <TooltipProvider delayDuration={50}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      {post.visibility === "PUBLIC" && <Globe className="h-3 w-3" />}
                      {post.visibility === "FRIENDS" && <Users className="h-3 w-3" />}
                      {post.visibility === "PRIVATE" && <Lock className="h-3 w-3" />}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent hideArrow>
                    <p className="capitalize">{post.visibility.toLowerCase()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <p className="text-sm whitespace-pre-wrap leading-6">{post.content}</p>

        {post.fileType === "img" && post.fileUrl && (
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
            <Image
              src={post.fileUrl}
              alt="Post image"
              width={1200}
              height={900}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {post.fileType === "pdf" && (
          <a
            href={post.fileUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
          >
            <FileText className="h-4 w-4" />
            Open PDF attachment
          </a>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => onLike(post.id, post.isLiked)}>
            <Heart className={`h-4 w-4 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`} />
            {post.likeCount}
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="h-4 w-4" />
            {post.commentCount || 0}
          </Button>

          {canDelete && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onDelete(post.id)}
              disabled={isDeleting}
              className="ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>

        {showComments && (
          <PostComments 
            postId={post.id} 
            currentUserId={currentUserId} 
            onCommentAdded={() => onCommentAdded?.(post.id)} 
            initialComments={post.comments}
          />
        )}
      </CardContent>
    </Card>
  );
};

export const PostCardSkeleton = () => {
  return (
    <Card className="border-zinc-200 dark:border-zinc-700/70 bg-white/95 dark:bg-[#2b2d31]">
      <CardContent className="p-4 space-y-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-11/12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-9/12 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-8 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
      </CardContent>
    </Card>
  );
};