import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { AiFillStar, AiOutlineBulb } from "react-icons/ai";
import { FiClock, FiHeadphones, FiBookmark } from "react-icons/fi";
import { getBookById } from "../../lib/api";
import { formatDuration } from "../../lib/formatDuration";
import { useAudioDuration } from "../../hooks/useAudioDuration";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { openModal } from "../../store/modalSlice";
import { db } from "../../lib/firebase";
import type { Book } from "../../types/book";

export default function BookPage() {
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const [book, setBook] = useState<Book | null>(null);
  const [saved, setSaved] = useState(false);
  const duration = useAudioDuration(book?.audioLink ?? "");

  useEffect(() => {
    if (typeof id !== "string") return;
    getBookById(id).then(setBook);
  }, [id]);

  if (!book) return <div className="book-page">Loading…</div>;

  const handleReadOrListen = () => {
    if (!user.uid) {
      dispatch(openModal("login"));
      return;
    }
    if (book.subscriptionRequired && user.subscription === "basic") {
      router.push("/choose-plan");
      return;
    }
    router.push(`/player/${book.id}`);
  };

  const handleAddToLibrary = async () => {
    if (!user.uid) {
      dispatch(openModal("login"));
      return;
    }
    await setDoc(doc(db, "users", user.uid, "library", book.id), {
      ...book,
      savedAt: serverTimestamp(),
    });
    setSaved(true);
  };

  return (
    <div className="book-page">
      <div className="book-page__header">
        <div>
          <h1 className="book-page__title">
            {book.title} {book.subscriptionRequired && "(Premium)"}
          </h1>
          <div className="book-page__author">{book.author}</div>
          <div className="book-page__stats">
            <span className="book-page__stat">
              <AiFillStar /> {book.averageRating} ({book.totalRating} ratings)
            </span>
            {duration !== null && (
              <span className="book-page__stat">
                <FiClock /> {formatDuration(duration)}
              </span>
            )}
            <span className="book-page__stat">
              <FiHeadphones /> {book.type}
            </span>
            <span className="book-page__stat">
              <AiOutlineBulb /> {book.keyIdeas} Key ideas
            </span>
          </div>
          <div className="book-page__actions">
            <button className="book-page__read-btn" onClick={handleReadOrListen}>
              Read
            </button>
            <button className="book-page__read-btn" onClick={handleReadOrListen}>
              Listen
            </button>
          </div>
          <button className="book-page__save" onClick={handleAddToLibrary}>
            <FiBookmark /> {saved ? "Saved to My Library" : "Add title to My Library"}
          </button>
        </div>
        <img className="book-page__image" src={book.imageLink} alt={book.title} />
      </div>

      <h2>What&apos;s it about?</h2>
      <div>
        {book.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <p className="book-page__description">{book.bookDescription}</p>

      <h2>About the author</h2>
      <p className="book-page__description">{book.authorDescription}</p>
    </div>
  );
}
