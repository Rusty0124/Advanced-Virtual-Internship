import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAppSelector } from "../hooks/redux";
import BookCard from "../components/book/BookCard";
import type { Book } from "../types/book";

export default function Library() {
  const user = useAppSelector((state) => state.user);
  const [saved, setSaved] = useState<Book[]>([]);
  const [finished, setFinished] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.uid) {
      setLoading(false);
      return;
    }
    Promise.all([
      getDocs(collection(db, "users", user.uid, "library")),
      getDocs(collection(db, "users", user.uid, "finished")),
    ]).then(([savedSnap, finishedSnap]) => {
      setSaved(savedSnap.docs.map((d) => d.data() as Book));
      setFinished(finishedSnap.docs.map((d) => d.data() as Book));
      setLoading(false);
    });
  }, [user.uid]);

  if (!user.uid) return <p>Log in to see your library.</p>;
  if (loading) return <p>Loading your library…</p>;

  return (
    <div className="library">
      <section>
        <h2 className="section-heading">Saved Books</h2>
        <div className="book-row">
          {saved.length ? saved.map((b) => <BookCard key={b.id} book={b} />) : <p>No saved books yet.</p>}
        </div>
      </section>
      <section>
        <h2 className="section-heading">Finished Books</h2>
        <div className="book-row">
          {finished.length ? finished.map((b) => <BookCard key={b.id} book={b} />) : <p>No finished books yet.</p>}
        </div>
      </section>
    </div>
  );
}