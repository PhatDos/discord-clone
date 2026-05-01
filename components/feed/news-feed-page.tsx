"use client";

import { useState } from "react";

import { CreatePostBox } from "./create-post-box";
import { FeedList } from "./feed-list";
import { FeedAuthor, FeedPost } from "./types";

interface NewsFeedPageProps {
  currentUser: FeedAuthor;
}

export const NewsFeedPage = ({ currentUser }: NewsFeedPageProps) => {
  const [latestCreatedPost, setLatestCreatedPost] = useState<FeedPost | null>(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Newsfeed</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Infinite scroll, optimistic likes, and realtime prepended posts.
        </p>
      </div>

      <CreatePostBox author={currentUser} onCreated={setLatestCreatedPost} />
      <FeedList profileId={currentUser.id} newPost={latestCreatedPost} />
    </div>
  );
};