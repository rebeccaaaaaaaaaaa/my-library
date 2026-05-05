import { useEffect, useMemo, useRef, useState } from "react"
import { FiMenu } from "react-icons/fi"
import { LeftPanel } from "@/components/organisms/left-panel"
import { ReaderPanel } from "@/components/organisms/reader-panel"
import { RightPanel } from "@/components/organisms/right-panel"
import type { LibraryBook } from "@/types/reader"
import { clamp, makeId } from "@/utils/reader"
import {
  getPdfPageCount,
  loadBooks,
  loadPdfUrl,
  saveBooks,
  savePdf,
  deletePdf,
} from "@/utils/storage"
import "./home.css"

type LibraryFilter = "all" | "favorites" | "trash"

function getDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function normalizeDailyGoal(value: number): number {
  return clamp(Math.round(value), 1, 200)
}

function readStoredBooks(): LibraryBook[] {
  const stored = loadBooks() ?? []
  return stored.map((book) => ({
    ...book,
    isFavorite: Boolean(book.isFavorite),
    notes: book.notes ?? [],
    bookmarks: book.bookmarks ?? [],
    highlights: book.highlights ?? [],
    dailyGoal: normalizeDailyGoal(book.dailyGoal ?? 12),
    readingStats: book.readingStats ?? [],
    deletedAt: book.deletedAt,
  }))
}

function filterBooksByView(books: LibraryBook[], filter: LibraryFilter): LibraryBook[] {
  if (filter === "trash") {
    return books.filter((book) => Boolean(book.deletedAt))
  }

  const activeBooks = books.filter((book) => !book.deletedAt)
  if (filter === "favorites") {
    return activeBooks.filter((book) => book.isFavorite)
  }

  return activeBooks
}

function Home() {
  const [books, setBooks] = useState<LibraryBook[]>(() => readStoredBooks())
  const [activeBookId, setActiveBookId] = useState(
    () => filterBooksByView(readStoredBooks(), "all")[0]?.id ?? "",
  )
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all")
  const [searchValue, setSearchValue] = useState("")
  const [zoom, setZoom] = useState(100)
  const [pageInput, setPageInput] = useState(() => {
    const stored = readStoredBooks()
    return String(stored[0]?.lastPage ?? 1)
  })
  const [noteDraft, setNoteDraft] = useState("")
  const [selectedHighlightText, setSelectedHighlightText] = useState("")

  // Keep a ref so the unmount cleanup always sees fresh blob URLs
  const booksRef = useRef(books)

  const filteredBooks = useMemo(() => {
    const sourceBooks = filterBooksByView(books, libraryFilter)

    if (!searchValue.trim()) return sourceBooks
    const term = searchValue.toLowerCase()
    return sourceBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term),
    )
  }, [books, searchValue, libraryFilter])

  const activeBook = useMemo(
    () => filteredBooks.find((book) => book.id === activeBookId) ?? filteredBooks[0],
    [activeBookId, filteredBooks],
  )

  useEffect(() => {
    booksRef.current = books
  }, [books])

  // Persist books metadata to localStorage on every change
  useEffect(() => {
    saveBooks(books)
  }, [books])

  // On mount: restore blob URLs for books whose PDFs are in IndexedDB
  useEffect(() => {
    books.forEach(async (book) => {
      if (!book.hasPdf) return
      const url = await loadPdfUrl(book.id)
      if (!url) return
      setBooks((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, sourceUrl: url } : b)),
      )
    })
    // Revoke all blob URLs on unmount
    return () => {
      booksRef.current.forEach((book) => {
        if (book.hasPdf && book.sourceUrl) URL.revokeObjectURL(book.sourceUrl)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyPage = (rawValue: string) => {
    if (!activeBook) return

    const parsed = Number(rawValue)
    const nextPage = Number.isFinite(parsed)
      ? clamp(Math.round(parsed), 1, activeBook.totalPages)
      : activeBook.lastPage


    setPageInput(String(nextPage))
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book

        const pagesReadNow = Math.max(0, nextPage - book.lastPage)
        const todayKey = getDayKey()
        let nextStats = book.readingStats

        if (pagesReadNow > 0) {
          const todayEntry = nextStats.find((entry) => entry.date === todayKey)
          if (todayEntry) {
            nextStats = nextStats.map((entry) =>
              entry.date === todayKey
                ? { ...entry, pages: entry.pages + pagesReadNow }
                : entry,
            )
          } else {
            nextStats = [...nextStats, { date: todayKey, pages: pagesReadNow }]
          }
        }

        return {
          ...book,
          lastPage: nextPage,
          progress: Math.round((nextPage / book.totalPages) * 100),
          readingStats: nextStats,
        }
      }),
    )
  }

  const setDailyGoal = (rawValue: number) => {
    if (!activeBook) return

    const goal = normalizeDailyGoal(rawValue)
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book
        return {
          ...book,
          dailyGoal: goal,
        }
      }),
    )
  }

  const deleteBookPermanently = async (bookId: string) => {
    const bookToDelete = books.find((b) => b.id === bookId)
    if (!bookToDelete) return

    if (bookToDelete.sourceUrl) {
      URL.revokeObjectURL(bookToDelete.sourceUrl)
    }

    if (bookToDelete.hasPdf) {
      try {
        await deletePdf(bookId)
      } catch (e) {
        console.error("Erro ao remover PDF do IndexedDB:", e)
      }
    }

    const newBooks = books.filter((b) => b.id !== bookId)
    setBooks(newBooks)

    if (activeBookId === bookId) {
      const nextActiveId = newBooks[0]?.id ?? ""
      setActiveBookId(nextActiveId)
      setPageInput(String(newBooks[0]?.lastPage ?? 1))
    }
  }

  const moveBookToTrash = (bookId: string) => {
    const trashedAt = new Date().toISOString()
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== bookId || book.deletedAt) return book
        return {
          ...book,
          deletedAt: trashedAt,
          isFavorite: false,
        }
      }),
    )

    if (activeBookId === bookId) {
      const nextBooks = filterBooksByView(
        books
          .map((book) =>
            book.id === bookId
              ? {
                  ...book,
                  deletedAt: trashedAt,
                  isFavorite: false,
                }
              : book,
          ),
        libraryFilter,
      )
      const nextBook = nextBooks[0]
      setActiveBookId(nextBook?.id ?? "")
      setPageInput(String(nextBook?.lastPage ?? 1))
    }
  }

  const restoreBook = (bookId: string) => {
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== bookId || !book.deletedAt) return book
        return {
          ...book,
          deletedAt: undefined,
        }
      }),
    )
  }

  const onPdfLoad = (detectedTotalPages: number) => {
    if (!activeBook) return

    const normalizedTotal = Math.max(1, detectedTotalPages)
    const nextPage = clamp(activeBook.lastPage, 1, normalizedTotal)

    setPageInput(String(nextPage))
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book

        if (book.totalPages === normalizedTotal && book.lastPage === nextPage) {
          return book
        }

        return {
          ...book,
          totalPages: normalizedTotal,
          lastPage: nextPage,
          progress: Math.round((nextPage / normalizedTotal) * 100),
        }
      }),
    )
  }

  const toggleFavorite = (bookId: string) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? { ...book, isFavorite: !book.isFavorite }
          : book,
      ),
    )
  }

  const addBookmark = (label: string) => {
    if (!activeBook) return

    const parsedLabel = label.trim()
    if (!parsedLabel) return

    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book
        return {
          ...book,
          bookmarks: [
            ...book.bookmarks,
            {
              id: makeId(),
              page: book.lastPage,
              label: parsedLabel,
              color: "blue",
            },
          ],
        }
      }),
    )
  }

  const removeBookmark = (bookmarkId: string) => {
    if (!activeBook) return

    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book
        return {
          ...book,
          bookmarks: book.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId),
        }
      }),
    )
  }

  const addNote = () => {
    if (!activeBook) return

    const text = noteDraft.trim()
    if (!text) return

    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book
        return {
          ...book,
          notes: [
            {
              id: makeId(),
              page: book.lastPage,
              text,
              date: new Date().toLocaleDateString("pt-BR"),
            },
            ...book.notes,
          ],
        }
      }),
    )
    setNoteDraft("")
  }

  const createNoteFromHighlight = () => {
    if (!activeBook) return

    const selectedText = selectedHighlightText.trim()
    if (!selectedText) return

    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book

        const hasSameHighlight = book.highlights.some(
          (highlight) =>
            highlight.page === book.lastPage &&
            highlight.text.toLowerCase() === selectedText.toLowerCase(),
        )

        return {
          ...book,
          highlights: hasSameHighlight
            ? book.highlights
            : [
                ...book.highlights,
                {
                  id: makeId(),
                  page: book.lastPage,
                  text: selectedText,
                },
              ],
          notes: [
            {
              id: makeId(),
              page: book.lastPage,
              text: selectedText,
              date: new Date().toLocaleDateString("pt-BR"),
            },
            ...book.notes,
          ],
        }
      }),
    )

    setSelectedHighlightText("")
    window.getSelection()?.removeAllRanges()
  }

  const removeNote = (noteId: string) => {
    if (!activeBook) return

    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book
        return {
          ...book,
          notes: book.notes.filter((note) => note.id !== noteId),
        }
      }),
    )
  }

  const onUploadPdf: React.ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    const id = makeId()
    const title = file.name.replace(/\.pdf$/i, "")
    const totalPages = await getPdfPageCount(file)
    await savePdf(id, file)
    const sourceUrl = URL.createObjectURL(file)

    const newBook: LibraryBook = {
      id,
      title,
      author: "PDF enviado",
      isFavorite: false,
      progress: Math.round((1 / Math.max(1, totalPages)) * 100),
      lastPage: 1,
      totalPages,
      sourceUrl,
      coverA: "#4f46e5",
      coverB: "#7c3aed",
      notes: [],
      bookmarks: [],
      highlights: [],
      dailyGoal: 12,
      readingStats: [],
      hasPdf: true,
    }

    setBooks((prev) => [newBook, ...prev])
    setActiveBookId(newBook.id)
    setPageInput("1")
    event.target.value = ""
  }

  return (
    <div className="reader-app">
      <LeftPanel
        onUploadPdf={onUploadPdf}
        onDeleteBook={moveBookToTrash}
        onPermanentDeleteBook={deleteBookPermanently}
        onRestoreBook={restoreBook}
        onToggleFavorite={toggleFavorite}
        activeFilter={libraryFilter}
        onFilterChange={(filter) => {
          setLibraryFilter(filter)
          const nextBooks = filterBooksByView(books, filter)
          const nextBook = nextBooks.find((book) => book.id === activeBookId) ?? nextBooks[0]
          setActiveBookId(nextBook?.id ?? "")
          setPageInput(String(nextBook?.lastPage ?? 1))
          setSelectedHighlightText("")
        }}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        books={filteredBooks}
        activeBookId={activeBook?.id ?? ""}
        onSelectBook={(bookId) => {
          const nextBook = books.find((book) => book.id === bookId)
          setActiveBookId(bookId)
          setPageInput(String(nextBook?.lastPage ?? 1))
          setSelectedHighlightText("")
        }}
      />

      <ReaderPanel
        activeBook={activeBook ?? null}
        highlights={activeBook?.highlights ?? []}
        onHighlightSelectionChange={setSelectedHighlightText}
        pageInput={pageInput}
        onPageInputChange={setPageInput}
        onApplyPage={applyPage}
        onPdfLoad={onPdfLoad}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <RightPanel
        activeBook={activeBook ?? null}
        noteDraft={noteDraft}
        selectedHighlightText={selectedHighlightText}
        onNoteDraftChange={setNoteDraft}
        onAddNote={addNote}
        onCreateNoteFromHighlight={createNoteFromHighlight}
        onRemoveNote={removeNote}
        onAddBookmark={addBookmark}
        onRemoveBookmark={removeBookmark}
        onApplyPage={applyPage}
        onSetDailyGoal={setDailyGoal}
      />

      <button className="mobile-menu-trigger" aria-label="Abrir menu">
        <FiMenu />
      </button>
    </div>
  )
}

export default Home
