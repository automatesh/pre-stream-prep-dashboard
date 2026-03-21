import { useState, useEffect, useCallback, useRef } from 'react'
import type { ChecklistItem } from '../../types/index'

export function useChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    window.api.getChecklist().then((data) => {
      setItems(data)
      setLoaded(true)
    })
  }, [])

  const persist = useCallback((next: ChecklistItem[]) => {
    setItems(next)
    window.api.saveChecklist(next)
  }, [])

  const addItem = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const item: ChecklistItem = {
        id: crypto.randomUUID(),
        text: trimmed,
        checked: false
      }
      persist([...itemsRef.current, item])
    },
    [persist]
  )

  const removeItem = useCallback(
    (id: string) => {
      persist(itemsRef.current.filter((i) => i.id !== id))
    },
    [persist]
  )

  const toggleItem = useCallback(
    (id: string) => {
      persist(
        itemsRef.current.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
      )
    },
    [persist]
  )

  const resetAll = useCallback(() => {
    persist(itemsRef.current.map((i) => ({ ...i, checked: false })))
  }, [persist])

  return { items, loaded, addItem, removeItem, toggleItem, resetAll }
}
