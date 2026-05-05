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

export type ReaderHighlight = {
  id: string
  page: number
  text: string
}

export type ReaderDailyStat = {
  date: string
  pages: number
}

export type LibraryBook = {
  id: string
  title: string
  author: string
  isFavorite: boolean
  deletedAt?: string
  coverImage?: string
  progress: number
  lastPage: number
  totalPages: number
  sourceUrl?: string
  coverA: string
  coverB: string
  notes: ReaderNote[]
  bookmarks: ReaderBookmark[]
  highlights: ReaderHighlight[]
  dailyGoal: number
  readingStats: ReaderDailyStat[]
  hasPdf?: boolean
}
