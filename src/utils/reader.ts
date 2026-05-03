export const makeId = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))
