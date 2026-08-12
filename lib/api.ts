const BASE_URL = "https://us-central1-summaristt.cloudfunctions.net";

export async function getBooksByStatus(status: "selected" | "recommended" | "suggested") {
  const res = await fetch(`${BASE_URL}/getBooks?status=${status}`);
  return res.json();
}

export async function getBookById(id: string) {
  const res = await fetch(`${BASE_URL}/getBook?id=${id}`);
  return res.json();
}

export async function searchBooks(query: string) {
  const res = await fetch(`${BASE_URL}/getBooksByAuthorOrTitle?search=${encodeURIComponent(query)}`);
  return res.json();
}