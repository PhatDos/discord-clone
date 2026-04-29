"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  createInitialFeed,
  FEED_PAGE_SIZE,
  getFeedPage,
  composeLivePost,
} from "./mock-feed-source";
import { PostCard, PostCardSkeleton } from "./post-card";
import { FeedPost } from "./types";

interface FeedListProps {
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

export const FeedList = ({ newPost }: FeedListProps) => {
  const feedSourceRef = useRef<FeedPost[]>(createInitialFeed());
  const lastHandledExternalId = useRef<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const hasMore = useMemo(() => cursor !== null, [cursor]);

  const prependPost = useCallback((post: FeedPost) => {
    feedSourceRef.current = [post, ...feedSourceRef.current.filter((item) => item.id !== post.id)];
    setPosts((prev) => [post, ...prev.filter((item) => item.id !== post.id)]);
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore) {
      return;
    }

    if (posts.length > 0 && !hasMore) {
      return;
    }

    setIsLoadingMore(true);

    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

    const page = getFeedPage(feedSourceRef.current, cursor, FEED_PAGE_SIZE);

    setPosts((prev) => mergeUnique([...prev, ...page.items]));
    setCursor(page.nextCursor);
    setIsInitialLoading(false);
    setIsLoadingMore(false);
  }, [cursor, hasMore, isLoadingMore, posts.length]);

  const handleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
        };
      })
    );

    feedSourceRef.current = feedSourceRef.current.map((post) => {
      if (post.id !== postId) {
        return post;
      }

      const nextLiked = !post.isLiked;
      return {
        ...post,
        isLiked: nextLiked,
        likeCount: Math.max(0, post.likeCount + (nextLiked ? 1 : -1)),
      };
    });
  }, []);

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
    const intervalId = setInterval(() => {
      const streamedPost = composeLivePost();
      prependPost(streamedPost);
    }, 20_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [prependPost]);

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
        <PostCard key={post.id} post={post} onLike={handleLike} />
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