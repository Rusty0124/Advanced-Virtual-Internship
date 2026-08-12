import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AiOutlineSearch } from "react-icons/ai";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { searchBooks } from "../../lib/api";
import type { Book } from "../../types/book";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }
    searchBooks(debouncedQuery).then(setResults);
  }, [debouncedQuery]);

  const goToBook = (id: string) => {
    setQuery("");
    setResults([]);
    router.push(`/book/${id}`);
  };

  return (
    <div className="search">
      <div className="search__bar">
        <input
          className="search__input"
          placeholder="Search for books"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="search__icon" aria-label="Search">
          <AiOutlineSearch />
        </button>
      </div>
      {results.length > 0 && (
        <ul className="search__results">
          {results.map((book) => (
            <li key={book.id} className="search__result" onClick={() => goToBook(book.id)}>
              <img src={book.imageLink} alt={book.title} />
              <div>
                <div className="search__result--title">{book.title}</div>
                <div className="search__result--author">{book.author}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}