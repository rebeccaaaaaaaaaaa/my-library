import {
  FiBook,
  FiBookmark,
  FiClock,
  FiPlus,
  FiSearch,
  FiTrash2,
} from "react-icons/fi"
import { BookCard } from "@/components/molecules/book-card"
import type { LibraryBook } from "@/types/reader"

type LibraryFilter = "all" | "favorites" | "trash"

type LeftPanelProps = {
  onUploadPdf: React.ChangeEventHandler<HTMLInputElement>
  onDeleteBook: (bookId: string) => void
  onPermanentDeleteBook: (bookId: string) => void
  onRestoreBook: (bookId: string) => void
  onToggleFavorite: (bookId: string, e: React.MouseEvent) => void
  activeFilter: LibraryFilter
  onFilterChange: (filter: LibraryFilter) => void
  searchValue: string
  onSearchChange: (value: string) => void
  books: LibraryBook[]
  activeBookId: string
  onSelectBook: (bookId: string) => void
}

export function LeftPanel({
  onUploadPdf,
  onDeleteBook,
  onPermanentDeleteBook,
  onRestoreBook,
  onToggleFavorite,
  activeFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  books,
  activeBookId,
  onSelectBook,
}: LeftPanelProps) {
  return (
    <aside className="left-panel">
      <div className="brand-row">
        <FiBook />
        <strong>My Lib</strong>
      </div>

      <label className="upload-btn">
        <FiPlus />
        Upload PDF
        <input
          type="file"
          accept="application/pdf"
          onChange={onUploadPdf}
          style={{ display: "none" }}
        />
      </label>

      <label className="search-input">
        <FiSearch />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar livros..."
        />
      </label>

      <p className="section-title">Minha Biblioteca</p>

      <div className="book-list">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            selected={book.id === activeBookId}
            inTrash={activeFilter === "trash"}
            onSelect={onSelectBook}
            onDelete={(bookId, e) => {
              e.stopPropagation()
              onDeleteBook(bookId)
            }}
            onRestore={(bookId, e) => {
              e.stopPropagation()
              onRestoreBook(bookId)
            }}
            onPermanentDelete={(bookId, e) => {
              e.stopPropagation()
              onPermanentDeleteBook(bookId)
            }}
            onToggleFavorite={(bookId, e) => {
              e.stopPropagation()
              onToggleFavorite(bookId, e)
            }}
          />
        ))}
      </div>

      <div className="left-footer-menu">
        <button
          className={`menu-item ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          <FiClock />
          Em andamento
        </button>
        <button
          className={`menu-item ${activeFilter === "favorites" ? "active" : ""}`}
          onClick={() => onFilterChange("favorites")}
        >
          <FiBookmark />
          Favoritos
        </button>
        <button
          className={`menu-item ${activeFilter === "trash" ? "active" : ""}`}
          onClick={() => onFilterChange("trash")}
        >
          <FiTrash2 />
          Lixeira
        </button>
      </div>
    </aside>
  )
}
