import { FiTrash2 } from "react-icons/fi"
import type { ReaderBookmark } from "@/types/reader"

type BookmarkItemProps = {
  bookmark: ReaderBookmark
  onJump: (page: number) => void
  onRemove: (bookmarkId: string) => void
}

export function BookmarkItem({ bookmark, onJump, onRemove }: BookmarkItemProps) {
  return (
    <div
      className="bookmark-item"
      role="button"
      tabIndex={0}
      onClick={() => onJump(bookmark.page)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onJump(bookmark.page)
        }
      }}
    >
      <span className={`bookmark-dot ${bookmark.color}`} />
      <div>
        <strong>{bookmark.label}</strong>
        <span>Pagina {bookmark.page}</span>
      </div>
      <button
        type="button"
        className="bookmark-delete-btn"
        onClick={(event) => {
          event.stopPropagation()
          onRemove(bookmark.id)
        }}
        aria-label="Desmarcar"
        title="Desmarcar"
      >
        <FiTrash2 />
      </button>
    </div>
  )
}
