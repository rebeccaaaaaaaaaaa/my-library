import { useState } from "react"
import { ProgressBar } from "@/components/atoms/progress-bar"
import { BookmarkItem } from "@/components/molecules/bookmark-item"
import { NoteCard } from "@/components/molecules/note-card"
import type { LibraryBook } from "@/types/reader"

type RightPanelProps = {
  activeBook: LibraryBook | null
  noteDraft: string
  onNoteDraftChange: (value: string) => void
  onAddNote: () => void
  onRemoveNote: (noteId: string) => void
  onAddBookmark: () => void
  onApplyPage: (rawValue: string) => void
}

export function RightPanel({
  activeBook,
  noteDraft,
  onNoteDraftChange,
  onAddNote,
  onRemoveNote,
  onAddBookmark,
  onApplyPage,
}: RightPanelProps) {
  const [showAllNotes, setShowAllNotes] = useState(false)

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
          <a href="#">Ver todos</a>
        </div>

        <button type="button" className="quick-action" onClick={onAddBookmark}>
          Adicionar marcador na pagina atual
        </button>

        <ul className="bookmark-list">
          {activeBook.bookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <BookmarkItem
                bookmark={bookmark}
                onJump={(page) => onApplyPage(String(page))}
              />
            </li>
          ))}
        </ul>
      </section>


    </aside>
  )
}
