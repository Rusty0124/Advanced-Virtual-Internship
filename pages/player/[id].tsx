import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FiPlay, FiPause } from "react-icons/fi";
import { BsArrowCounterclockwise, BsArrowClockwise } from "react-icons/bs";
import { getBookById } from "../../lib/api";
import { formatDuration } from "../../lib/formatDuration";
import { db } from "../../lib/firebase";
import { useAppSelector } from "../../hooks/redux";
import type { Book } from "../../types/book";

export default function PlayerPage() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAppSelector((state) => state.user);

  const [book, setBook] = useState<Book | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (typeof id !== "string") return;
    getBookById(id).then(setBook);
  }, [id]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleFinished = async () => {
    setIsPlaying(false);
    if (!user.uid || !book) return;
    await setDoc(doc(db, "users", user.uid, "finished", book.id), {
      ...book,
      finishedAt: serverTimestamp(),
    });
  };

  if (!book) return <div className="player-page">Loading…</div>;

  return (
    <div className="player-page">
      <div className="player-page__content">
        <h1>{book.title}</h1>
        <p className="player-page__summary">{book.summary}</p>
      </div>

      <div className="player-bar">
        <div className="player-bar__book">
          <img src={book.imageLink} alt={book.title} />
          <div>
            <div className="player-bar__title">{book.title}</div>
            <div className="player-bar__author">{book.author}</div>
          </div>
        </div>

        <div className="player-bar__controls">
          <button onClick={() => skip(-10)} aria-label="Back 10 seconds">
            <BsArrowCounterclockwise />
          </button>
          <button className="player-bar__play" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <FiPause /> : <FiPlay />}
          </button>
          <button onClick={() => skip(10)} aria-label="Forward 10 seconds">
            <BsArrowClockwise />
          </button>
        </div>

        <div className="player-bar__seek">
          <span>{formatDuration(currentTime)}</span>
          <input type="range" min={0} max={duration || 0} value={currentTime} onChange={handleSeek} />
          <span>{formatDuration(duration)}</span>
        </div>

        <audio
          ref={audioRef}
          src={book.audioLink}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          onEnded={handleFinished}
        />
      </div>
    </div>
  );
}