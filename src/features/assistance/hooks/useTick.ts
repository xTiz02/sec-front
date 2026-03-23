import { useState, useEffect } from "react"

/** Increments every second — used to drive live timers without storing time in state. */
export function useTick(): number {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  return tick
}
