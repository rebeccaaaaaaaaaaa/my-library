import { ProgressBar } from "@/components/atoms/progress-bar"
import { BookmarkItem } from "@/components/molecules/bookmark-item"
import { NoteCard } from "@/components/molecules/note-card"
import type { LibraryBook } from "@/types/reader"

type RightPanelProps = {
  activeBook: LibraryBook
  pageInput: string
  noteDraft: string
  onNoteDraftChange: (value: string) => void
  onAddNote: () => void
  onAddBookmark: () => void
  onApplyPage: (rawValue: string) => void
}

export function RightPanel({
  activeBook,
  pageInput,
  noteDraft,
  onNoteDraftChange,
  onAddNote,
  onAddBookmark,
  onApplyPage,
}: RightPanelProps) {
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
          <a href="#">Ver todas</a>
        </div>

        <label className="note-input-wrap">
          <textarea
            value={noteDraft}
            placeholder="Adicionar anotacao rapida..."
            onChange={(event) => onNoteDraftChange(event.target.value)}
          />
          <button onClick={onAddNote}>Salvar</button>
        </label>

        {activeBook.notes.slice(0, 2).map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </section>

      <section className="info-card">
        <div className="card-head">
          <h3>Marcadores</h3>
          <a href="#">Ver todos</a>
        </div>

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

      <section className="info-card compact">
        <div className="card-head">
          <h3>Acoes rapidas</h3>
        </div>
        <button className="quick-action" onClick={() => onApplyPage(pageInput)}>
          Ir para pagina
        </button>
        <button className="quick-action" onClick={onAddBookmark}>
          Adicionar marcador
        </button>
        <button className="quick-action" onClick={onAddNote}>
          Salvar anotacao
        </button>
      </section>
    </aside>
  )
}
