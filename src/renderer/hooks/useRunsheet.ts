import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { RunsheetSegment } from '../../types/index'

export function useRunsheet() {
  const [segments, setSegments] = useState<RunsheetSegment[]>([])
  const [loaded, setLoaded] = useState(false)
  const segmentsRef = useRef(segments)
  segmentsRef.current = segments

  useEffect(() => {
    window.api.getRunsheet().then((data) => {
      setSegments(data)
      setLoaded(true)
    })
  }, [])

  const persist = useCallback((next: RunsheetSegment[]) => {
    const ordered = next.map((s, i) => ({ ...s, order: i }))
    setSegments(ordered)
    window.api.saveRunsheet(ordered)
  }, [])

  const addSegment = useCallback(
    (title: string, durationMinutes: number) => {
      const trimmed = title.trim()
      if (!trimmed) return
      const segment: RunsheetSegment = {
        id: crypto.randomUUID(),
        title: trimmed,
        durationMinutes,
        order: segmentsRef.current.length
      }
      persist([...segmentsRef.current, segment])
    },
    [persist]
  )

  const removeSegment = useCallback(
    (id: string) => {
      persist(segmentsRef.current.filter((s) => s.id !== id))
    },
    [persist]
  )

  const moveSegment = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const list = [...segmentsRef.current]
      const idx = list.findIndex((s) => s.id === id)
      if (idx === -1) return
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= list.length) return
      ;[list[idx], list[targetIdx]] = [list[targetIdx], list[idx]]
      persist(list)
    },
    [persist]
  )

  const updateSegment = useCallback(
    (id: string, patch: Partial<Pick<RunsheetSegment, 'title' | 'durationMinutes'>>) => {
      persist(
        segmentsRef.current.map((s) => (s.id === id ? { ...s, ...patch } : s))
      )
    },
    [persist]
  )

  const totalDuration = useMemo(
    () => segments.reduce((sum, s) => sum + s.durationMinutes, 0),
    [segments]
  )

  return { segments, loaded, addSegment, removeSegment, moveSegment, updateSegment, totalDuration }
}
