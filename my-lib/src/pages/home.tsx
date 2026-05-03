import { useEffect, useMemo, useRef, useState } from "react"
import { FiMenu } from "react-icons/fi"
import { LeftPanel } from "@/components/organisms/left-panel"
import { ReaderPanel } from "@/components/organisms/reader-panel"
import { RightPanel } from "@/components/organisms/right-panel"
import { initialBooks } from "@/mocks/library"
import type { LibraryBook } from "@/types/reader"
import { clamp, makeId } from "@/utils/reader"
import "./home.css"

function Home() {
  const [books, setBooks] = useState<LibraryBook[]>(initialBooks)
  const [activeBookId, setActiveBookId] = useState(initialBooks[0].id)
  const [searchValue, setSearchValue] = useState("")
  const [zoom, setZoom] = useState(100)
  const [pageInput, setPageInput] = useState(String(initialBooks[0].lastPage))
  const [noteDraft, setNoteDraft] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (!activeBook) return
    setPageInput(String(activeBook.lastPage))
  }, [activeBook])

  useEffect(() => {
    return () => {
      books.forEach((book) => {
        if (book.isUploaded && book.sourceUrl) {
          URL.revokeObjectURL(book.sourceUrl)
        }
      })
    }
  }, [books])

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
              date: "Agora",
            },
            ...book.notes,
          ],
        }
      }),
    )
    setNoteDraft("")
  }

  const onUploadPdf: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const sourceUrl = URL.createObjectURL(file)
    const title = file.name.replace(/\.pdf$/i, "")
    const newBook: LibraryBook = {
      id: makeId(),
      title,
      author: "PDF enviado",
      progress: 1,
      lastPage: 1,
      totalPages: 200,
      sourceUrl,
      coverA: "#4f46e5",
      coverB: "#7c3aed",
      notes: [],
      bookmarks: [],
      isUploaded: true,
    }

    setBooks((prev) => [newBook, ...prev])
    setActiveBookId(newBook.id)
    setPageInput("1")
    event.target.value = ""
  }

  return (
    <div className="reader-app">
      <input
        ref={fileRef}
        className="sr-only-input"
        type="file"
        accept="application/pdf"
        onChange={onUploadPdf}
      />

      <LeftPanel
        fileInputRef={fileRef}
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
