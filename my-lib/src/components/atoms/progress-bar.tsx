type ProgressBarProps = {
  value: number
  big?: boolean
}

export function ProgressBar({ value, big = false }: ProgressBarProps) {
  return (
    <div className={`progress-line ${big ? "big" : ""}`.trim()}>
      <div style={{ width: `${value}%` }} />
    </div>
  )
}
