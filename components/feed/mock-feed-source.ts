import { FeedAuthor, FeedPost } from "./types";

export const FEED_PAGE_SIZE = 5;

const AUTHORS: FeedAuthor[] = [
  { id: "u-1", name: "Mina", imageUrl: "/favicon.ico" },
  { id: "u-2", name: "Kai", imageUrl: "/globe.svg" },
  { id: "u-3", name: "Lena", imageUrl: "/next.svg" },
  { id: "u-4", name: "Noah", imageUrl: "/vercel.svg" },
];

const DEMO_CONTENT = [
  "Shipped a small UI polish for mobile spacing today.",
  "Quick update: migrating the feed to cursor pagination helped smooth scroll feel.",
  "Anyone else prefers simple timelines over over-designed dashboards?",
  "Added subtle loading skeletons so the page never flashes blank.",
  "Realtime prepend is now stable and keeps newest posts on top.",
  "Working on a cleaner post composer with better keyboard UX.",
  "Keeping this version intentionally lightweight: text first, media second.",
  "Today felt productive. Wrapping up with one final refactor pass.",
];

const IMG_POOL = ["/next.svg", "/vercel.svg", "/globe.svg"];

const randomItem = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const isoMinutesAgo = (minutes: number) => {
  return new Date(Date.now() - minutes * 60_000).toISOString();
};

const makeSeedPost = (index: number): FeedPost => {
  const author = AUTHORS[index % AUTHORS.length];
  const slot = index % 6;

  if (slot === 1) {
    return {
      id: `seed-${index}`,
      content: `Sprint snapshot ${index + 1}: visual checkpoints attached below.`,
      fileType: "img",
      fileUrl: IMG_POOL[index % IMG_POOL.length],
      createdAt: isoMinutesAgo(index * 14 + 4),
      likeCount: (index * 7) % 21,
      author,
      isLiked: false,
    };
  }

  if (slot === 4) {
    return {
      id: `seed-${index}`,
      content: "Draft notes for the next release are attached as a PDF preview card.",
      fileType: "pdf",
      fileUrl: "#",
      createdAt: isoMinutesAgo(index * 14 + 4),
      likeCount: (index * 5) % 15,
      author,
      isLiked: false,
    };
  }

  return {
    id: `seed-${index}`,
    content: DEMO_CONTENT[index % DEMO_CONTENT.length],
    fileType: "text",
    createdAt: isoMinutesAgo(index * 14 + 4),
    likeCount: (index * 3) % 19,
    author,
    isLiked: false,
  };
};

export const createInitialFeed = () => {
  return Array.from({ length: 24 }, (_, index) => makeSeedPost(index));
};

type FeedPageResult = {
  items: FeedPost[];
  nextCursor: string | null;
};

export const getFeedPage = (
  source: FeedPost[],
  cursor: string | null,
  limit = FEED_PAGE_SIZE
): FeedPageResult => {
  const sorted = [...source].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const startIndex = cursor
    ? sorted.findIndex((post) => new Date(post.createdAt).getTime() < new Date(cursor).getTime())
    : 0;

  if (cursor && startIndex === -1) {
    return { items: [], nextCursor: null };
  }

  const items = sorted.slice(startIndex, startIndex + limit);
  const nextCursor = items.length === limit ? items[items.length - 1].createdAt : null;

  return { items, nextCursor };
};

type ComposePostArgs = {
  content: string;
  author: FeedAuthor;
};

export const composeLocalPost = ({ content, author }: ComposePostArgs): FeedPost => {
  return {
    id: crypto.randomUUID(),
    content: content.trim(),
    fileType: "text",
    createdAt: new Date().toISOString(),
    likeCount: 0,
    author,
    isLiked: false,
  };
};

export const composeLivePost = (): FeedPost => {
  const author = randomItem(AUTHORS);

  return {
    id: crypto.randomUUID(),
    content: randomItem(DEMO_CONTENT),
    fileType: "text",
    createdAt: new Date().toISOString(),
    likeCount: Math.floor(Math.random() * 4),
    author,
    isLiked: false,
  };
};