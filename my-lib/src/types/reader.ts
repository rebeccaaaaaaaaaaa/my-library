export type ReaderNote = {
  id: string
  page: number
  text: string
  date: string
}

export type ReaderBookmark = {
  id: string
  page: number
  label: string
  color: "blue" | "yellow" | "purple"
}

export type LibraryBook = {
  id: string
  title: string
  author: string
  progress: number
  lastPage: number
  totalPages: number
  sourceUrl?: string
  coverA: string
  coverB: string
  notes: ReaderNote[]
  bookmarks: ReaderBookmark[]
  isUploaded?: boolean
}
