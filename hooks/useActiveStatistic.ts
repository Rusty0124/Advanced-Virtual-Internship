import { useEffect, useRef } from "react";

// Optional: highlights whichever ".statistics__heading" corresponds to the
// ".statistics__data" row currently centered in the viewport.
export function useActiveStatistic() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const headings = Array.from(wrapper.querySelectorAll<HTMLElement>(".statistics__heading"));
    const dataRows = Array.from(wrapper.querySelectorAll<HTMLElement>(".statistics__data"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = dataRows.indexOf(entry.target as HTMLElement);
          if (index === -1) return;
          headings.forEach((h) => h.classList.remove("statistics__heading--active"));
          headings[index]?.classList.add("statistics__heading--active");
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );

    dataRows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  return wrapperRef;
}