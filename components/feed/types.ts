export type FeedFileType = "text" | "img" | "pdf";

export type FeedAuthor = {
  id: string;
  name: string;
  imageUrl: string;
};

export type FeedPost = {
  id: string;
  content: string;
  fileUrl?: string;
  fileType: FeedFileType;
  createdAt: string;
  likeCount: number;
  author: FeedAuthor;
  isLiked: boolean;
};