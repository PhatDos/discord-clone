import { useEffect, useState } from "react";

type ChatScrollProps = {
  chatRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  shouldLoadMore: boolean;
  loadMore: () => void;
  count: number;
};

export const useChatScroll = ({
  chatRef,
  bottomRef,
  shouldLoadMore,
  count,
  loadMore,
}: ChatScrollProps) => {
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const chatDiv = chatRef.current;
    if (!chatDiv) return;

    const handleScroll = () => {
      if (chatDiv.scrollTop === 0 && shouldLoadMore) {
        const prevHeight = chatDiv.scrollHeight;
        loadMore();
        setTimeout(() => {
          chatDiv.scrollTop = chatDiv.scrollHeight - prevHeight;
        }, 50);
      }
    };

    chatDiv.addEventListener("scroll", handleScroll);
    return () => chatDiv.removeEventListener("scroll", handleScroll);
  }, [shouldLoadMore, loadMore, chatRef]);

  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
    }
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [count, bottomRef, hasInitialized]);
};
