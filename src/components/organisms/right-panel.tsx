import { useState } from "react"
import { ProgressBar } from "@/components/atoms/progress-bar"
import { BookmarkItem } from "@/components/molecules/bookmark-item"
import { NoteCard } from "@/components/molecules/note-card"
import type { LibraryBook } from "@/types/reader"

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function toDate(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next
}

function calcStreak(activeBook: LibraryBook): number {
  const stats = activeBook.readingStats
    .filter((entry) => entry.pages > 0)
    .sort((a, b) => b.date.localeCompare(a.date))

  if (stats.length === 0) return 0

  const today = toDate(dayKey())
  let expected = today
  let streak = 0

  for (const entry of stats) {
    const entryDate = toDate(entry.date)
    if (entryDate.getTime() === expected.getTime()) {
      streak += 1
      expected = addDays(expected, -1)
      continue
    }
    if (entryDate.getTime() > expected.getTime()) continue
    break
  }

  return streak
}

function calcForecast(activeBook: LibraryBook): string {
  const remainingPages = Math.max(0, activeBook.totalPages - activeBook.lastPage)
  if (remainingPages === 0) return "Concluido"

  const recent = activeBook.readingStats
    .filter((entry) => entry.pages > 0)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7)

  const totalRead = recent.reduce((sum, entry) => sum + entry.pages, 0)
  const avg = recent.length > 0 ? totalRead / recent.length : 0
  if (avg <= 0) return "Sem previsao"

  const daysToFinish = Math.max(1, Math.ceil(remainingPages / avg))
  return addDays(new Date(), daysToFinish).toLocaleDateString("pt-BR")
}

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
  onSetDailyGoal: (goal: number) => void
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
  onSetDailyGoal,
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
  const todayPages = activeBook.readingStats.find((entry) => entry.date === dayKey())?.pages ?? 0
  const dailyProgress = Math.min(100, Math.round((todayPages / activeBook.dailyGoal) * 100))
  const streak = calcStreak(activeBook)
  const forecastFinish = calcForecast(activeBook)

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

      <section className="info-card mission-card">
        <div className="card-head">
          <h3>Missao Diaria</h3>
        </div>

        <div className="metric-row">
          <span>Paginas hoje</span>
          <strong>
            {todayPages} / {activeBook.dailyGoal}
          </strong>
        </div>
        <ProgressBar value={dailyProgress} big />

        <label className="goal-row">
          <span>Meta diaria</span>
          <input
            type="number"
            min={1}
            max={200}
            value={activeBook.dailyGoal}
            onChange={(event) => onSetDailyGoal(Number(event.target.value))}
          />
        </label>

        <div className="mission-insights">
          <p>
            Sequencia atual: <strong>{streak} dia(s)</strong>
          </p>
          <p>
            Previsao de termino: <strong>{forecastFinish}</strong>
          </p>
        </div>
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
