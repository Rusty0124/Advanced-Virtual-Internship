import { useEffect, useState } from "react";

// The Book API has no duration field — read it straight off the audio file.
export function useAudioDuration(audioLink: string): number | null {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    const audio = new Audio(audioLink);
    const onMeta = () => setDuration(audio.duration);
    audio.addEventListener("loadedmetadata", onMeta);
    return () => audio.removeEventListener("loadedmetadata", onMeta);
  }, [audioLink]);

  return duration;
}