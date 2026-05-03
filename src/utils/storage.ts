import type { LibraryBook } from "@/types/reader"

const DB_NAME = "bookly-db"
const DB_VERSION = 1
const PDF_STORE = "pdfs"
const BOOKS_KEY = "bookly-books"

// ─── IndexedDB – PDF binary files ────────────────────────────────────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(PDF_STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePdf(id: string, file: File): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readwrite")
    tx.objectStore(PDF_STORE).put(file, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadPdfUrl(id: string): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readonly")
    const req = tx.objectStore(PDF_STORE).get(id)
    req.onsuccess = () => {
      if (!req.result) return resolve(null)
      const blob =
        req.result instanceof Blob
          ? req.result
          : new Blob([req.result as ArrayBuffer], { type: "application/pdf" })
      resolve(URL.createObjectURL(blob))
    }
    req.onerror = () => reject(req.error)
  })
}

export async function deletePdf(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PDF_STORE, "readwrite")
    tx.objectStore(PDF_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ─── localStorage – book metadata ────────────────────────────────────────────

export function loadBooks(): LibraryBook[] | null {
  const raw = localStorage.getItem(BOOKS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as LibraryBook[]
  } catch {
    return null
  }
}

/** Persists books without the ephemeral sourceUrl blob. */
export function saveBooks(books: LibraryBook[]): void {
  const toStore = books.map(({ sourceUrl: _url, ...rest }) => rest)
  localStorage.setItem(BOOKS_KEY, JSON.stringify(toStore))
}

// ─── PDF utilities ─────────────────────────────────────────────────────────────

/**
 * Reads the PDF binary and heuristically detects the page count by looking for
 * the /Count entry inside the document's page tree.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer()
  const text = new TextDecoder("latin1").decode(buffer)
  const matches = [...text.matchAll(/\/Count\s+(\d+)/g)]
  if (matches.length === 0) return 1
  const counts = matches.map((m) => parseInt(m[1], 10))
  return Math.max(...counts)
}
