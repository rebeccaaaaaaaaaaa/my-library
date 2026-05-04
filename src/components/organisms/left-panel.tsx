import {
  FiBook,
  FiBookmark,
  FiClock,
  FiPlus,
  FiSearch,
  FiUpload,
} from "react-icons/fi"
import { BookCard } from "@/components/molecules/book-card"
import type { LibraryBook } from "@/types/reader"

type LibraryFilter = "all" | "favorites"

type LeftPanelProps = {
  onUploadPdf: React.ChangeEventHandler<HTMLInputElement>
  onDeleteBook: (bookId: string) => void
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
            onSelect={onSelectBook}
            onDelete={(bookId, e) => {
              e.stopPropagation()
              onDeleteBook(bookId)
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
        <button className="menu-item">
          <FiUpload />
          Lixeira
        </button>
      </div>
    </aside>
  )
}
