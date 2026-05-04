import type { PropsWithChildren } from "react"

type ActionIconButtonProps = PropsWithChildren<{
  onClick?: () => void
  ariaLabel?: string
  title?: string
  className?: string
}>

export function ActionIconButton({
  children,
  onClick,
  ariaLabel,
  title,
  className,
}: ActionIconButtonProps) {
  return (
    <button onClick={onClick} aria-label={ariaLabel} title={title} className={className}>
      {children}
    </button>
  )
}
