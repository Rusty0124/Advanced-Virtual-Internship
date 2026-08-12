import { useRouter } from "next/router";
import { AiFillStar, AiOutlineClockCircle } from "react-icons/ai";
import { useAudioDuration } from "../../hooks/useAudioDuration";
import { formatDuration } from "../../lib/formatDuration";
import type { Book } from "../../types/book";

export default function BookCard({ book }: { book: Book }) {
  const router = useRouter();
  const duration = useAudioDuration(book.audioLink);

  return (
    <div className="book-card" onClick={() => router.push(`/book/${book.id}`)}>
      <div className="book-card__image--wrapper">
        {book.subscriptionRequired && <span className="pill">Premium</span>}
        <img className="book-card__image" src={book.imageLink} alt={book.title} />
      </div>
      <div className="book-card__title">{book.title}</div>
      <div className="book-card__author">{book.author}</div>
      <div className="book-card__subtitle">{book.subTitle}</div>
      <div className="book-card__meta">
        {duration !== null && (
          <span>
            <AiOutlineClockCircle /> {formatDuration(duration)}
          </span>
        )}
        <span>
          <AiFillStar /> {book.averageRating}
        </span>
      </div>
    </div>
  );
}