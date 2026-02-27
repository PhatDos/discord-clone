export interface LivekitTokenResponse {
  token?: string;
}

export const getLivekitToken = async (room: string, username: string) => {
  const response = await fetch(`/api/livekit?room=${room}&username=${username}`);
  return response.json() as Promise<LivekitTokenResponse>;
};
