import type { ReaderNote } from "@/types/reader"

type NoteCardProps = {
  note: ReaderNote
}

export function NoteCard({ note }: NoteCardProps) {
  return (
    <article className="note-card">
      <p>{note.text}</p>
      <div>
        <span>Pagina {note.page}</span>
        <span>{note.date}</span>
      </div>
    </article>
  )
}
