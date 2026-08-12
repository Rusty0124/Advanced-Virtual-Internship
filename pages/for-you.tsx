import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AiFillPlayCircle } from "react-icons/ai";
import { getBooksByStatus } from "../lib/api";
import { formatDuration } from "../lib/formatDuration";
import { useAudioDuration } from "../hooks/useAudioDuration";
import BookCard from "../components/book/BookCard";
import BookCardSkeleton from "../components/book/BookCardSkeleton";
import type { Book } from "../types/book";

function SelectedBook({ book }: { book: Book }) {
  const router = useRouter();
  const duration = useAudioDuration(book.audioLink);

  return (
    <div className="selected-book" onClick={() => router.push(`/book/${book.id}`)}>
      <div className="selected-book__description">{book.subTitle}</div>
      <div className="selected-book__divider" />
      <img className="selected-book__image" src={book.imageLink} alt={book.title} />
      <div>
        <div className="selected-book__title">{book.title}</div>
        <div className="selected-book__author">{book.author}</div>
        {duration !== null && (
          <div className="selected-book__duration">
            <AiFillPlayCircle className="selected-book__play" />
            {formatDuration(duration)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ForYou() {
  const [selected, setSelected] = useState<Book | null>(null);
  const [recommended, setRecommended] = useState<Book[]>([]);
  const [suggested, setSuggested] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getBooksByStatus("selected"),
      getBooksByStatus("recommended"),
      getBooksByStatus("suggested"),
    ]).then(([selectedBooks, recommendedBooks, suggestedBooks]) => {
      setSelected(selectedBooks[0] ?? null);
      setRecommended(recommendedBooks);
      setSuggested(suggestedBooks);
      setLoading(false);
    });
  }, []);

  return (
    <div className="for-you">
      <section>
        <h2 className="section-heading">Selected just for you</h2>
        {loading || !selected ? <BookCardSkeleton /> : <SelectedBook book={selected} />}
      </section>

      <section>
        <h2 className="section-heading">Recommended For You</h2>
        <div className="section-subheading">We think you&apos;ll like these</div>
        <div className="book-row">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)
            : recommended.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>

      <section>
        <h2 className="section-heading">Suggested Books</h2>
        <div className="section-subheading">Browse those books</div>
        <div className="book-row">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)
            : suggested.map((book) => <BookCard key={book.id} book={book} />)}
        </div>
      </section>
    </div>
  );
}