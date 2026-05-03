import type { PropsWithChildren } from "react"

type ActionIconButtonProps = PropsWithChildren<{
  onClick?: () => void
}>

export function ActionIconButton({ children, onClick }: ActionIconButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
