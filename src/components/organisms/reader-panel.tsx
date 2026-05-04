import { useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import {
  FiBookmark,
  FiFileText,
  FiList,
  FiLoader,
  FiMoon,
  FiSearch,
  FiSun,
  FiUpload,
  FiUser,
} from "react-icons/fi"
import { ActionIconButton } from "@/components/atoms/action-icon-button"
import type { LibraryBook } from "@/types/reader"

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

type ReaderPanelProps = {
  activeBook: LibraryBook | null
  pageInput: string
  onPageInputChange: (value: string) => void
  onApplyPage: (rawValue: string) => void
  onPdfLoad: (totalPages: number) => void
  zoom: number
  onZoomChange: (zoom: number) => void
}

export function ReaderPanel({
  activeBook,
  pageInput,
  onPageInputChange,
  onApplyPage,
  onPdfLoad,
  zoom,
  onZoomChange,
}: ReaderPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const lastScrollRef = useRef(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateWidth = () => setContainerWidth(element.clientWidth)
    updateWidth()

    const observer = new ResizeObserver(updateWidth)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const pageWidth = useMemo(() => {
    if (containerWidth <= 0) return undefined
    const baseWidth = Math.floor(containerWidth * 0.88)
    return Math.max(260, Math.floor(baseWidth * (zoom / 100)))
  }, [containerWidth, zoom])

  const activePdfBook = activeBook?.sourceUrl ? activeBook : null

  const handleScrollTriggerPageChange: React.UIEventHandler<HTMLDivElement> = (event) => {
    if (!activeBook || !activePdfBook) return

    const el = event.currentTarget
    const currentScroll = el.scrollTop
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
    const isAtTop = el.scrollTop <= 20
    const wasScrollingDown = currentScroll > lastScrollRef.current
    const wasScrollingUp = currentScroll < lastScrollRef.current

    lastScrollRef.current = currentScroll

    // Próxima página: scroll para baixo no final
    if (wasScrollingDown && isAtBottom && activeBook.lastPage < activeBook.totalPages) {
      onApplyPage(String(activeBook.lastPage + 1))
      el.scrollTop = 0
      lastScrollRef.current = 0
      return
    }

    // Página anterior: scroll para cima no topo
    if (wasScrollingUp && isAtTop && activeBook.lastPage > 1) {
      onApplyPage(String(activeBook.lastPage - 1))
      el.scrollTop = el.scrollHeight
      lastScrollRef.current = el.scrollHeight
    }
  }

  const handleKeyChange: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!activeBook || !activePdfBook) return

    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault()
      onApplyPage(String(activeBook.lastPage + 1))
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault()
      onApplyPage(String(activeBook.lastPage - 1))
    }
  }

  return (
    <main className="reader-panel">
      <header className="top-header">
        <div>
          <h1>{activeBook?.title ?? "Sua biblioteca"}</h1>
          <p>{activeBook?.author ?? "Envie um PDF para comecar a leitura"}</p>
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
        <button
          onClick={() => onApplyPage(String((activeBook?.lastPage ?? 1) - 1))}
          disabled={!activeBook}
        >
          Anterior
        </button>

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
            disabled={!activeBook}
          />
          <span>/</span>
          <strong>{activeBook?.totalPages ?? 0}</strong>
        </div>

        <div className="zoom-control">
          <button onClick={() => onZoomChange(Math.max(50, zoom - 10))} disabled={!activeBook}>
            -
          </button>
          <button onClick={() => onZoomChange(Math.min(200, zoom + 10))} disabled={!activeBook}>
            +
          </button>
          <span>{zoom}%</span>
        </div>
      </section>

      <section className="reader-canvas-wrap">
        <div
          ref={containerRef}
          className="reader-canvas"
          onScroll={handleScrollTriggerPageChange}
          onKeyDown={handleKeyChange}
          tabIndex={0}
          aria-label={`Leitor PDF de ${activeBook?.title ?? "biblioteca"}`}
        >
          {activePdfBook ? (
            <Document
              key={activePdfBook.id}
              file={activePdfBook.sourceUrl}
              className="pdf-document"
              loading={
                <div className="empty-reader-state">
                  <FiLoader className="spin-icon" />
                  <p>Carregando PDF...</p>
                </div>
              }
              error={
                <div className="empty-reader-state">
                  <FiFileText />
                  <p>Nao foi possivel renderizar este PDF.</p>
                </div>
              }
              onLoadSuccess={({ numPages }) => onPdfLoad(numPages)}
            >
              <Page
                className="pdf-page"
                pageNumber={activePdfBook.lastPage}
                width={pageWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                loading={
                  <div className="empty-reader-state">
                    <FiLoader className="spin-icon" />
                    <p>Renderizando pagina...</p>
                  </div>
                }
              />
            </Document>
          ) : activeBook?.hasPdf ? (
            <div className="empty-reader-state">
              <FiLoader className="spin-icon" />
              <p>Carregando PDF...</p>
            </div>
          ) : (
            <div className="empty-reader-state">
              <FiUpload />
              <p>Sua biblioteca esta vazia. Envie um PDF para comecar.</p>
            </div>
          )}
        </div>
      </section>

      <footer className="reader-footer">
        <input
          type="range"
          min={1}
          max={activeBook?.totalPages ?? 1}
          value={activeBook?.lastPage ?? 1}
          onChange={(event) => onApplyPage(event.target.value)}
          disabled={!activeBook}
        />
        <span>
          {activeBook?.lastPage ?? 0} / {activeBook?.totalPages ?? 0}
        </span>
      </footer>
    </main>
  )
}
