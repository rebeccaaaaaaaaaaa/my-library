import { useState } from "react"
import { ProgressBar } from "@/components/atoms/progress-bar"
import { BookmarkItem } from "@/components/molecules/bookmark-item"
import { NoteCard } from "@/components/molecules/note-card"
import type { LibraryBook } from "@/types/reader"

type RightPanelProps = {
  activeBook: LibraryBook | null
  noteDraft: string
  selectedHighlightText: string
  onNoteDraftChange: (value: string) => void
  onAddNote: () => void
  onCreateNoteFromHighlight: () => void
  onRemoveNote: (noteId: string) => void
  onAddBookmark: (label: string) => void
  onRemoveBookmark: (bookmarkId: string) => void
  onApplyPage: (rawValue: string) => void
}

export function RightPanel({
  activeBook,
  noteDraft,
  selectedHighlightText,
  onNoteDraftChange,
  onAddNote,
  onCreateNoteFromHighlight,
  onRemoveNote,
  onAddBookmark,
  onRemoveBookmark,
  onApplyPage,
}: RightPanelProps) {
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [showAllBookmarks, setShowAllBookmarks] = useState(false)
  const [bookmarkDraft, setBookmarkDraft] = useState("")

  if (!activeBook) {
    return (
      <aside className="right-panel">
        <section className="info-card compact">
          <div className="card-head">
            <h3>Biblioteca vazia</h3>
          </div>
          <p>Envie seu primeiro PDF para comecar a leitura.</p>
        </section>
      </aside>
    )
  }

  const hasMoreThanPreview = activeBook.notes.length > 2
  const visibleNotes = showAllNotes ? activeBook.notes : activeBook.notes.slice(0, 2)
  const hasMoreBookmarksThanPreview = activeBook.bookmarks.length > 3
  const visibleBookmarks = showAllBookmarks
    ? activeBook.bookmarks
    : activeBook.bookmarks.slice(0, 3)

  return (
    <aside className="right-panel">
      <section className="info-card">
        <div className="card-head">
          <h3>Progresso da Leitura</h3>
        </div>
        <p className="progress-percent">{activeBook.progress}% concluido</p>
        <ProgressBar value={activeBook.progress} big />
        <div className="metric-row">
          <span>Ultima pagina lida</span>
          <strong>
            {activeBook.lastPage} de {activeBook.totalPages}
          </strong>
        </div>
        <button className="cta-btn" onClick={() => onApplyPage(String(activeBook.lastPage + 1))}>
          Continuar lendo
        </button>
      </section>

      <section className="info-card">
        <div className="card-head">
          <h3>Anotacoes</h3>
          {hasMoreThanPreview ? (
            <button
              type="button"
              className="card-link-btn"
              onClick={() => setShowAllNotes((prev) => !prev)}
            >
              {showAllNotes ? "Ver menos" : "Ver todas"}
            </button>
          ) : null}
        </div>

        <label className="note-input-wrap">
          <textarea
            value={noteDraft}
            placeholder="Adicionar anotacao rapida..."
            onChange={(event) => onNoteDraftChange(event.target.value)}
          />
          <button onClick={onAddNote}>Salvar</button>
        </label>

        {selectedHighlightText ? (
          <div className="highlight-preview">
            <p>{selectedHighlightText}</p>
            <button type="button" onClick={onCreateNoteFromHighlight}>
              Criar anotacao do destaque
            </button>
          </div>
        ) : null}

        {visibleNotes.length > 0 ? (
          visibleNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onJump={(page) => onApplyPage(String(page))}
              onDelete={(noteId) => onRemoveNote(noteId)}
            />
          ))
        ) : (
          <p className="notes-empty">Sem anotacoes ainda.</p>
        )}
      </section>

      <section className="info-card">
        <div className="card-head">
          <h3>Marcadores</h3>
          {hasMoreBookmarksThanPreview ? (
            <button
              type="button"
              className="card-link-btn"
              onClick={() => setShowAllBookmarks((prev) => !prev)}
            >
              {showAllBookmarks ? "Ver menos" : "Ver todos"}
            </button>
          ) : null}
        </div>

        <label className="bookmark-input-wrap">
          <input
            value={bookmarkDraft}
            onChange={(event) => setBookmarkDraft(event.target.value)}
            placeholder={`Nome do marcador na pagina ${activeBook.lastPage}`}
          />
          <button
            type="button"
            onClick={() => {
              const parsed = bookmarkDraft.trim()
              if (!parsed) return
              onAddBookmark(parsed)
              setBookmarkDraft("")
            }}
          >
            Salvar marcador
          </button>
        </label>

        {visibleBookmarks.length > 0 ? (
          <ul className="bookmark-list">
            {visibleBookmarks.map((bookmark) => (
              <li key={bookmark.id}>
                <BookmarkItem
                  bookmark={bookmark}
                  onJump={(page) => onApplyPage(String(page))}
                  onRemove={(bookmarkId) => onRemoveBookmark(bookmarkId)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="notes-empty">Sem marcadores ainda.</p>
        )}
      </section>


    </aside>
  )
}
