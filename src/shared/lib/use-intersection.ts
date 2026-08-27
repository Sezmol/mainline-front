import { useEffect, useRef } from "react";

export const useIntersection = <T extends HTMLElement>(
  onIntersect: () => void,
  enabled: boolean,
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersect();
      },
      { rootMargin: "400px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return ref;
};
