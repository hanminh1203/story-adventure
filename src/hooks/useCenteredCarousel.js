import { useCallback } from "react";
import { prefersReducedMotion } from "../lib/motion";

export function useCenteredCarousel(containerRef, itemSelector) {
  const getItems = useCallback(() => {
    if (!containerRef.current) return [];
    return [...containerRef.current.querySelectorAll(itemSelector)];
  }, [containerRef, itemSelector]);

  const getCenteredIndex = useCallback(() => {
    const items = getItems();
    if (items.length === 0 || !containerRef.current) return 0;

    const container = containerRef.current;
    const center = container.scrollLeft + container.clientWidth / 2;
    let bestIndex = 0;
    let bestDistance = Infinity;

    items.forEach((item, index) => {
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(center - itemCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    return bestIndex;
  }, [containerRef, getItems]);

  const scrollToItem = useCallback(
    (itemIndex, behavior = "smooth") => {
      const items = getItems();
      const item = items[itemIndex];
      if (!item) return;

      const resolvedBehavior =
        behavior === "instant" || prefersReducedMotion() ? "auto" : "smooth";
      item.scrollIntoView({
        behavior: resolvedBehavior,
        inline: "center",
        block: "nearest",
      });
    },
    [getItems]
  );

  return {
    getItems,
    getCenteredIndex,
    scrollToItem,
  };
}
