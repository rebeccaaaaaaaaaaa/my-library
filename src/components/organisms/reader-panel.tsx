import { useEffect, useMemo, useRef, useState } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import pdfWorkerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import {
  FiBookmark,
  FiFileText,
  FiList,
  FiLoader,
  FiMaximize2,
  FiMoon,
  FiSearch,
  FiSun,
  FiUpload,
  FiUser,
} from "react-icons/fi"
import { ActionIconButton } from "@/components/atoms/action-icon-button"
import { useColorMode } from "@/components/ui/color-mode"
import type { LibraryBook } from "@/types/reader"

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerSrc

const READER_LIGHT_LEVEL_KEY = "reader-light-level"
const PAGE_TURN_COOLDOWN_MS = 260

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
  const { colorMode, setColorMode } = useColorMode()
  const containerRef = useRef<HTMLDivElement>(null)
  const transitionTimeoutRef = useRef<number | undefined>(undefined)
  const pageTurnTimeoutRef = useRef<number | undefined>(undefined)
  const isPageTurnLockedRef = useRef(false)
  const renderedBookIdRef = useRef<string | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [lightLevel, setLightLevel] = useState(100)
  const [displayPage, setDisplayPage] = useState(1)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const lastScrollRef = useRef(0)

  useEffect(() => {
    const raw = localStorage.getItem(READER_LIGHT_LEVEL_KEY)
    if (!raw) return
    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return
    setLightLevel(Math.max(70, Math.min(130, Math.round(parsed))))
  }, [])

  useEffect(() => {
    localStorage.setItem(READER_LIGHT_LEVEL_KEY, String(lightLevel))
  }, [lightLevel])

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
  const lightPercent = Math.max(70, Math.min(130, Math.round(lightLevel)))

  useEffect(() => {
    return () => {
      if (pageTurnTimeoutRef.current) {
        window.clearTimeout(pageTurnTimeoutRef.current)
      }
    }
  }, [])

  const lockPageTurn = () => {
    isPageTurnLockedRef.current = true
    if (pageTurnTimeoutRef.current) {
      window.clearTimeout(pageTurnTimeoutRef.current)
    }
    pageTurnTimeoutRef.current = window.setTimeout(() => {
      isPageTurnLockedRef.current = false
    }, PAGE_TURN_COOLDOWN_MS)
  }

  const changePageBy = (delta: number) => {
    if (!activeBook || !activePdfBook || delta === 0) return
    onApplyPage(String(activeBook.lastPage + delta))
    lockPageTurn()
  }

  useEffect(() => {
    if (!activePdfBook) {
      renderedBookIdRef.current = null
      setDisplayPage(1)
      setIsPageTransitioning(false)
      return
    }

    const isDifferentBook = renderedBookIdRef.current !== activePdfBook.id
    if (isDifferentBook) {
      renderedBookIdRef.current = activePdfBook.id
      setDisplayPage(activePdfBook.lastPage)
      setIsPageTransitioning(false)
      return
    }

    if (displayPage === activePdfBook.lastPage) return

    setIsPageTransitioning(true)
    transitionTimeoutRef.current = window.setTimeout(() => {
      setDisplayPage(activePdfBook.lastPage)
      setIsPageTransitioning(false)
    }, 140)

    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [activePdfBook, displayPage])

  const handleScrollTriggerPageChange: React.UIEventHandler<HTMLDivElement> = (event) => {
    if (!activeBook || !activePdfBook) return

    const el = event.currentTarget
    const currentScroll = el.scrollTop
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 20
    const isAtTop = el.scrollTop <= 20
    const wasScrollingDown = currentScroll > lastScrollRef.current
    const wasScrollingUp = currentScroll < lastScrollRef.current

    if (isPageTurnLockedRef.current || isPageTransitioning) {
      lastScrollRef.current = currentScroll
      return
    }

    lastScrollRef.current = currentScroll

    // Próxima página: scroll para baixo no final
    if (wasScrollingDown && isAtBottom && activeBook.lastPage < activeBook.totalPages) {
      changePageBy(1)
      el.scrollTop = 0
      lastScrollRef.current = 0
      return
    }

    // Página anterior: scroll para cima no topo
    if (wasScrollingUp && isAtTop && activeBook.lastPage > 1) {
      changePageBy(-1)
      el.scrollTop = el.scrollHeight
      lastScrollRef.current = el.scrollHeight
    }
  }

  const handleKeyChange: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (!activeBook || !activePdfBook) return

    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault()
      changePageBy(1)
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault()
      changePageBy(-1)
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
          <ActionIconButton
            onClick={() => setColorMode("light")}
            ariaLabel="Ativar tema claro"
            title="Tema claro"
            className={colorMode === "light" ? "is-active" : undefined}
          >
            <FiSun />
          </ActionIconButton>
          <ActionIconButton
            onClick={() => setColorMode("dark")}
            ariaLabel="Ativar tema escuro"
            title="Tema escuro"
            className={colorMode === "dark" ? "is-active" : undefined}
          >
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

        <div className="light-control">
          <FiMaximize2 aria-hidden="true" />
          <input
            type="range"
            min={70}
            max={130}
            value={lightPercent}
            onChange={(event) => setLightLevel(Number(event.target.value))}
            aria-label="Ajustar iluminacao do leitor"
          />
          <strong>{lightPercent}%</strong>
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
            <div
              className={`pdf-light-stage ${isPageTransitioning ? "is-page-changing" : ""}`}
              style={{ filter: `brightness(${lightPercent}%)` }}
            >
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
                  pageNumber={displayPage}
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
            </div>
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
