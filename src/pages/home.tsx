import { useEffect, useMemo, useRef, useState } from "react"
import { FiMenu } from "react-icons/fi"
import { LeftPanel } from "@/components/organisms/left-panel"
import { ReaderPanel } from "@/components/organisms/reader-panel"
import { RightPanel } from "@/components/organisms/right-panel"
import { initialBooks } from "@/mocks/library"
import type { LibraryBook } from "@/types/reader"
import { clamp, makeId } from "@/utils/reader"
import {
  getPdfPageCount,
  loadBooks,
  loadPdfUrl,
  saveBooks,
  savePdf,
} from "@/utils/storage"
import "./home.css"

function Home() {
  const [books, setBooks] = useState<LibraryBook[]>(
    () => loadBooks() ?? initialBooks,
  )
  const [activeBookId, setActiveBookId] = useState(
    () => (loadBooks() ?? initialBooks)[0]?.id ?? "",
  )
  const [searchValue, setSearchValue] = useState("")
  const [zoom, setZoom] = useState(100)
  const [pageInput, setPageInput] = useState(() => {
    const stored = loadBooks() ?? initialBooks
    return String(stored[0]?.lastPage ?? 1)
  })
  const [noteDraft, setNoteDraft] = useState("")

  // Keep a ref so the unmount cleanup always sees fresh blob URLs
  const booksRef = useRef(books)
  booksRef.current = books

  const activeBook = useMemo(
    () => books.find((book) => book.id === activeBookId) ?? books[0],
    [activeBookId, books],
  )

  const filteredBooks = useMemo(() => {
    if (!searchValue.trim()) return books
    const term = searchValue.toLowerCase()
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term),
    )
  }, [books, searchValue])

  // Sync page input when active book changes
  useEffect(() => {
    if (!activeBook) return
    setPageInput(String(activeBook.lastPage))
  }, [activeBook])

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

  if (!activeBook) return null

  const applyPage = (rawValue: string) => {
    const parsed = Number(rawValue)
    const nextPage = Number.isFinite(parsed)
      ? clamp(Math.round(parsed), 1, activeBook.totalPages)
      : activeBook.lastPage

    setPageInput(String(nextPage))
    setBooks((prev) =>
      prev.map((book) => {
        if (book.id !== activeBook.id) return book
        return {
          ...book,
          lastPage: nextPage,
          progress: Math.round((nextPage / book.totalPages) * 100),
        }
      }),
    )
  }

  const addBookmark = () => {
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
              label: `Marcador na pagina ${book.lastPage}`,
              color: "blue",
            },
          ],
        }
      }),
    )
  }

  const addNote = () => {
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
      progress: 0,
      lastPage: 1,
      totalPages,
      sourceUrl,
      coverA: "#4f46e5",
      coverB: "#7c3aed",
      notes: [],
      bookmarks: [],
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
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        books={filteredBooks}
        activeBookId={activeBook.id}
        onSelectBook={setActiveBookId}
      />

      <ReaderPanel
        activeBook={activeBook}
        pageInput={pageInput}
        onPageInputChange={setPageInput}
        onApplyPage={applyPage}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <RightPanel
        activeBook={activeBook}
        pageInput={pageInput}
        noteDraft={noteDraft}
        onNoteDraftChange={setNoteDraft}
        onAddNote={addNote}
        onAddBookmark={addBookmark}
        onApplyPage={applyPage}
      />

      <button className="mobile-menu-trigger" aria-label="Abrir menu">
        <FiMenu />
      </button>
    </div>
  )
}

export default Home
