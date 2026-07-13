import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavBadgeState {
  lastViewed: Record<string, string>;
  markViewed: (key: string) => void;
  ensureInitialized: (key: string) => void;
}

export const useNavBadgeStore = create<NavBadgeState>()(
  persist(
    (set, get) => ({
      lastViewed: {},
      markViewed: (key) =>
        set((state) => ({
          lastViewed: { ...state.lastViewed, [key]: new Date().toISOString() },
        })),
      ensureInitialized: (key) => {
        if (get().lastViewed[key]) return;
        set((state) => ({
          lastViewed: { ...state.lastViewed, [key]: new Date().toISOString() },
        }));
      },
    }),
    { name: "vettly-nav-badges" }
  )
);
