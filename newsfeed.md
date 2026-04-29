# Newsfeed UI (Frontend-only)

This document rewrites the Newsfeed feature currently implemented in this project.

## Scope

- UI only.
- No real API call.
- No backend write/read.
- Data is mocked and managed in local client state.

## FE Contract (target shape)

### Feed endpoint contract (reference)

`GET /feed?cursor=createdAt`

Response:

```ts
{
  items: Post[];
  nextCursor: string | null;
}
```

### Post shape used in UI

```ts
type Post = {
  id: string;
  content: string;
  fileUrl?: string;
  fileType: "text" | "img" | "pdf";

  createdAt: string;
  likeCount: number;

  author: {
    id: string;
    name: string;
    imageUrl: string;
  };

  isLiked: boolean;
};
```

## Implemented Components

### 1. CreatePostBox

Location: `components/feed/create-post-box.tsx`

- User types content in a textarea.
- Press `Post` to create a local post object.
- New post is immediately prepended to feed.
- No network request.

### 2. PostCard

Location: `components/feed/post-card.tsx`

- Render author avatar/name.
- Render text content.
- Render media based on `fileType`:
  - `img`: image block.
  - `pdf`: attachment row.
- Render like action and created time.

### 3. FeedList

Location: `components/feed/feed-list.tsx`

- Initial skeleton loading.
- Cursor pagination by `createdAt` from local source.
- Infinite scroll with `IntersectionObserver` sentinel.
- Manual `Load more` fallback button.
- Optimistic like toggle (UI first).
- Realtime prepend simulation with interval (SSE-like behavior in UI only).

### 4. NewsFeedPage

Location: `components/feed/news-feed-page.tsx`

- Composes `CreatePostBox` + `FeedList`.
- Manages latest created post and forwards it into the feed list.

### 5. Route Page

Location: `app/(main)/(routes)/newsfeed/page.tsx`

- Uses current profile to pass current user into NewsFeed page.
- Protected route behavior is preserved.

## Local Data Layer (Mock)

Location: `components/feed/mock-feed-source.ts`

- Seed post generation.
- Cursor page extractor.
- Local post composer.
- Live post composer (stream simulation).

## UX Behaviors Included

- Optimistic UI for like.
- New posts are always shown at top.
- Skeleton loading state.
- Cursor-based pagination.
- Infinite scrolling.

## DB Mapping (reference only)

- Feed -> `Post`
- Avatar -> `Profile`
- Like -> `Like` + `Post.likeCount`
- Follow feed -> `Follow`

## Current Limitation

Because this is frontend-only implementation, these are not connected yet:

- `GET /feed`
- `POST /posts`
- `POST /posts/:id/like`
- SSE endpoint

When backend integration starts, replace mock source and interval stream with real API + realtime channel.
