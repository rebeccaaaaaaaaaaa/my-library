import { ProgressBar } from "@/components/atoms/progress-bar"
import type { LibraryBook } from "@/types/reader"

type BookCardProps = {
  book: LibraryBook
  selected: boolean
  onSelect: (bookId: string) => void
}

export function BookCard({ book, selected, onSelect }: BookCardProps) {
  return (
    <button
      className={`book-card ${selected ? "is-selected" : ""}`}
      onClick={() => onSelect(book.id)}
    >
      <div
        className="book-cover"
        style={{
          background: `linear-gradient(140deg, ${book.coverA}, ${book.coverB})`,
        }}
      />
      <div className="book-meta">
        <span className="book-title">{book.title}</span>
        <span className="book-author">{book.author}</span>
        <ProgressBar value={book.progress} />
      </div>
      <span className="book-percent">{book.progress}%</span>
    </button>
  )
}
