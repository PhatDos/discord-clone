import { create } from "zustand";

interface ChannelSwitchStore {
  isSwitchingChannel: boolean;
  switchingChannelId: string | null;
  startSwitchingChannel: (channelId: string) => void;
  finishSwitchingChannel: () => void;
}

export const useChannelSwitchStore = create<ChannelSwitchStore>((set) => ({
  isSwitchingChannel: false,
  switchingChannelId: null,
  startSwitchingChannel: (channelId) =>
    set({ isSwitchingChannel: true, switchingChannelId: channelId }),
  finishSwitchingChannel: () =>
    set({ isSwitchingChannel: false, switchingChannelId: null }),
}));
