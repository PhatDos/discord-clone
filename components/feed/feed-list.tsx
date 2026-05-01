"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useApiClient } from "@/hooks/use-api-client";
import { useToast } from "@/hooks/use-toast";

import { deletePost, getUserPosts, likePost, unlikePost } from "@/services/posts-client-service";
import { PostCard, PostCardSkeleton } from "./post-card";
import { FeedPost } from "./types";

const FEED_PAGE_SIZE = 5;

interface FeedListProps {
  profileId: string;
  newPost: FeedPost | null;
}

const mergeUnique = (posts: FeedPost[]) => {
  const seen = new Set<string>();
  const deduped: FeedPost[] = [];

  for (const post of posts) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      deduped.push(post);
    }
  }

  return deduped;
};

export const FeedList = ({ profileId, newPost }: FeedListProps) => {
  const lastHandledExternalId = useRef<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const api = useApiClient();
  const { toast } = useToast();

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const hasMore = useMemo(() => cursor !== null, [cursor]);

  const prependPost = useCallback((post: FeedPost) => {
    setPosts((prev) => [post, ...prev.filter((item) => item.id !== post.id)]);
  }, []);

  const resetFeed = useCallback(() => {
    lastHandledExternalId.current = null;
    setPosts([]);
    setCursor(null);
    setIsInitialLoading(true);
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore) {
      return;
    }

    if (posts.length > 0 && !hasMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const page = await getUserPosts(api, cursor, FEED_PAGE_SIZE);

      setPosts((prev) => mergeUnique([...prev, ...page.items]));
      setCursor(page.nextCursor);
    } catch (error) {
      toast({
        title: "Cannot load feed",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  }, [api, cursor, hasMore, isLoadingMore, posts.length, profileId, toast]);

  const handleLike = useCallback(
    async (postId: string, currentIsLiked: boolean) => {
      const nextLiked = !currentIsLiked;

      // Optimistic update
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            isLiked: nextLiked,
            likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
          };
        })
      );

      try {
        if (nextLiked) {
          await likePost(api, postId);
        } else {
          await unlikePost(api, postId);
        }
      } catch {
        // Revert on error
        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              isLiked: currentIsLiked,
              likeCount: Math.max(0, post.likeCount + (currentIsLiked ? 1 : -1)),
            };
          })
        );
        toast({
          title: "Action failed",
          description: "Could not update your like. Please try again.",
          variant: "destructive",
        });
      }
    },
    [api, toast]
  );

  const handleDelete = useCallback(
    async (postId: string) => {
      if (deletingPostId) {
        return;
      }

      try {
        setDeletingPostId(postId);
        await deletePost(api, postId);
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        toast({
          title: "Post deleted",
          description: "The post was removed successfully.",
          variant: "success",
        });
      } catch {
        toast({
          title: "Cannot delete post",
          description: "You may not be the author or the post no longer exists.",
          variant: "destructive",
        });
      } finally {
        setDeletingPostId(null);
      }
    },
    [api, deletingPostId, toast]
  );

  useEffect(() => {
    resetFeed();
  }, [profileId, resetFeed]);

  useEffect(() => {
    void loadMore();
  }, [loadMore]);

  useEffect(() => {
    if (!newPost) {
      return;
    }

    if (newPost.id === lastHandledExternalId.current) {
      return;
    }

    lastHandledExternalId.current = newPost.id;
    prependPost(newPost);
  }, [newPost, prependPost]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

  const handleCommentAdded = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          commentCount: (post.commentCount || 0) + 1,
        };
      })
    );
  }, []);

  if (isInitialLoading) {
    return (
      <div className="space-y-3">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          currentUserId={profileId}
          onDelete={handleDelete}
          isDeleting={deletingPostId === post.id}
          onCommentAdded={handleCommentAdded}
        />
      ))}

      <div ref={sentinelRef} className="h-1" />

      <div className="flex justify-center py-2">
        {hasMore ? (
          <Button type="button" variant="outline" onClick={() => void loadMore()} disabled={isLoadingMore}>
            {isLoadingMore ? "Loading..." : "Load more"}
          </Button>
        ) : (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">You have reached the end of the feed.</p>
        )}
      </div>
    </div>
  );
};