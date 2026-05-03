import type { ReaderBookmark } from "@/types/reader"

type BookmarkItemProps = {
  bookmark: ReaderBookmark
  onJump: (page: number) => void
}

export function BookmarkItem({ bookmark, onJump }: BookmarkItemProps) {
  return (
    <button className="bookmark-item" onClick={() => onJump(bookmark.page)}>
      <span className={`bookmark-dot ${bookmark.color}`} />
      <div>
        <strong>{bookmark.label}</strong>
        <span>Pagina {bookmark.page}</span>
      </div>
    </button>
  )
}
