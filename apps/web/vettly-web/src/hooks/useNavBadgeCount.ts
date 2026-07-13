import { useEffect } from "react";
import { useNavBadgeStore } from "../stores/navBadgeStore";

export function useNavBadgeCount(key: string, timestamps: string[]): number {
  const lastViewed = useNavBadgeStore((s) => s.lastViewed[key]);
  const ensureInitialized = useNavBadgeStore((s) => s.ensureInitialized);

  useEffect(() => {
    ensureInitialized(key);
  }, [key, ensureInitialized]);

  if (!lastViewed) return 0;
  return timestamps.filter((t) => t > lastViewed).length;
}
