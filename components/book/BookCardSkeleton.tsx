export default function BookCardSkeleton() {
  return (
    <div className="book-card book-card--skeleton">
      <div className="skeleton book-card__image" />
      <div className="skeleton skeleton--line" style={{ width: "70%" }} />
      <div className="skeleton skeleton--line" style={{ width: "40%" }} />
      <div className="skeleton skeleton--line" style={{ width: "90%" }} />
    </div>
  );
}