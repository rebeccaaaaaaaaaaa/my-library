import { FiCornerUpLeft, FiStar, FiTrash2 } from "react-icons/fi"
import { ProgressBar } from "@/components/atoms/progress-bar"
import type { LibraryBook } from "@/types/reader"

type BookCardProps = {
  book: LibraryBook
  selected: boolean
  inTrash: boolean
  onSelect: (bookId: string) => void
  onDelete: (bookId: string, e: React.MouseEvent) => void
  onPermanentDelete?: (bookId: string, e: React.MouseEvent) => void
  onRestore?: (bookId: string, e: React.MouseEvent) => void
  onToggleFavorite: (bookId: string, e: React.MouseEvent) => void
}

export function BookCard({
  book,
  selected,
  inTrash,
  onSelect,
  onDelete,
  onPermanentDelete,
  onRestore,
  onToggleFavorite,
}: BookCardProps) {
  return (
    <div
      className={`book-card ${selected ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(book.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect(book.id)
        }
      }}
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
      {!inTrash ? (
        <>
          <button
            className={`book-favorite-btn ${book.isFavorite ? "is-favorite" : ""}`}
            onClick={(e) => onToggleFavorite(book.id, e)}
            aria-label={book.isFavorite ? `Desfavoritar ${book.title}` : `Favoritar ${book.title}`}
            title={book.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <FiStar />
          </button>
          <button
            className="book-delete-btn"
            onClick={(e) => onDelete(book.id, e)}
            aria-label={`Mover ${book.title} para lixeira`}
            title="Mover para lixeira"
          >
            <FiTrash2 />
          </button>
        </>
      ) : (
        <>
          <button
            className="book-restore-btn"
            onClick={(e) => onRestore?.(book.id, e)}
            aria-label={`Restaurar ${book.title}`}
            title="Restaurar livro"
          >
            <FiCornerUpLeft />
          </button>
          <button
            className="book-delete-btn"
            onClick={(e) => onPermanentDelete?.(book.id, e)}
            aria-label={`Excluir ${book.title} permanentemente`}
            title="Excluir permanentemente"
          >
            <FiTrash2 />
          </button>
        </>
      )}
    </div>
  )
}
