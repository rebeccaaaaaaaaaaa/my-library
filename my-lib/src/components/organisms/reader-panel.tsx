import { FiBookmark, FiList, FiMoon, FiSearch, FiSun, FiUpload, FiUser } from "react-icons/fi"
import { ActionIconButton } from "@/components/atoms/action-icon-button"
import type { LibraryBook } from "@/types/reader"

type ReaderPanelProps = {
  activeBook: LibraryBook
  pageInput: string
  onPageInputChange: (value: string) => void
  onApplyPage: (rawValue: string) => void
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function ReaderPanel({
  activeBook,
  pageInput,
  onPageInputChange,
  onApplyPage,
  zoom,
  onZoomChange,
}: ReaderPanelProps) {
  const readerUrl = activeBook.sourceUrl
    ? `${activeBook.sourceUrl}#page=${activeBook.lastPage}&zoom=${zoom}`
    : undefined

  return (
    <main className="reader-panel">
      <header className="top-header">
        <div>
          <h1>{activeBook.title}</h1>
          <p>{activeBook.author}</p>
        </div>

        <div className="header-actions">
          <ActionIconButton>
            <FiSearch />
          </ActionIconButton>
          <ActionIconButton>
            <FiBookmark />
          </ActionIconButton>
          <ActionIconButton>
            <FiList />
          </ActionIconButton>
          <ActionIconButton>
            <FiSun />
          </ActionIconButton>
          <ActionIconButton>
            <FiMoon />
          </ActionIconButton>
          <span className="avatar-badge">
            <FiUser />
          </span>
        </div>
      </header>

      <section className="reader-toolbar">
        <button onClick={() => onApplyPage(String(activeBook.lastPage - 1))}>Anterior</button>

        <div className="page-control">
          <input
            value={pageInput}
            onChange={(event) => onPageInputChange(event.target.value)}
            onBlur={() => onApplyPage(pageInput)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onApplyPage(pageInput)
              }
            }}
          />
          <span>/</span>
          <strong>{activeBook.totalPages}</strong>
        </div>

        <div className="zoom-control">
          <button onClick={() => onZoomChange(Math.max(50, zoom - 10))}>-</button>
          <button onClick={() => onZoomChange(Math.min(200, zoom + 10))}>+</button>
          <span>{zoom}%</span>
        </div>
      </section>

      <section className="reader-canvas-wrap">
        <div className="reader-canvas">
          {readerUrl ? (
            <iframe title={activeBook.title} src={readerUrl} className="pdf-frame" />
          ) : (
            <div className="empty-reader-state">
              <FiUpload />
              <p>Selecione um livro ou envie um PDF para comecar a leitura.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="reader-footer">
        <input
          type="range"
          min={1}
          max={activeBook.totalPages}
          value={activeBook.lastPage}
          onChange={(event) => onApplyPage(event.target.value)}
        />
        <span>
          {activeBook.lastPage} / {activeBook.totalPages}
        </span>
      </footer>
    </main>
  )
}
