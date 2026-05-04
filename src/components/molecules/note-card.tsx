import { FiTrash2 } from "react-icons/fi"
import type { ReaderNote } from "@/types/reader"

type NoteCardProps = {
  note: ReaderNote
  onJump: (page: number) => void
  onDelete: (noteId: string) => void
}

export function NoteCard({ note, onJump, onDelete }: NoteCardProps) {
  return (
    <article className="note-card">
      <p>{note.text}</p>
      <div>
        <button type="button" className="note-link-btn" onClick={() => onJump(note.page)}>
          Pagina {note.page}
        </button>
        <span>{note.date}</span>
      </div>
      <button
        type="button"
        className="note-delete-btn"
        onClick={() => onDelete(note.id)}
        aria-label="Remover anotacao"
        title="Remover anotacao"
      >
        <FiTrash2 />
      </button>
    </article>
  )
}
