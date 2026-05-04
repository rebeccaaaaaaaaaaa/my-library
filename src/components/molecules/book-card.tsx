import { FiTrash2 } from "react-icons/fi"
import { ProgressBar } from "@/components/atoms/progress-bar"
import type { LibraryBook } from "@/types/reader"

type BookCardProps = {
  book: LibraryBook
  selected: boolean
  onSelect: (bookId: string) => void
  onDelete: (bookId: string, e: React.MouseEvent) => void
}

export function BookCard({ book, selected, onSelect, onDelete }: BookCardProps) {
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
      <button
        className="book-delete-btn"
        onClick={(e) => onDelete(book.id, e)}
        aria-label={`Remover ${book.title}`}
        title="Remover livro"
      >
        <FiTrash2 />
      </button>
    </button>
  )
}
