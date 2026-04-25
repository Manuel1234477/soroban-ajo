import { useState, useCallback, useMemo } from 'react'

export type FilterOperator = 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'in'

export interface FilterCriterion {
  id: string
  field: string
  operator: FilterOperator
  value: any
  label?: string
}

export interface FilterPreset {
  id: string
  name: string
  criteria: FilterCriterion[]
  isDefault?: boolean
}

export interface UseAdvancedFiltersReturn {
  criteria: FilterCriterion[]
  presets: FilterPreset[]
  activeCriteria: FilterCriterion[]
  addCriterion: (criterion: Omit<FilterCriterion, 'id'>) => void
  removeCriterion: (id: string) => void
  updateCriterion: (id: string, updates: Partial<FilterCriterion>) => void
  clearAll: () => void
  savePreset: (name: string) => void
  loadPreset: (presetId: string) => void
  deletePreset: (presetId: string) => void
  applyFilters: <T>(data: T[], evaluator: (item: T, criteria: FilterCriterion[]) => boolean) => T[]
}

const STORAGE_KEY = 'ajo_filter_presets'

export function useAdvancedFilters(): UseAdvancedFiltersReturn {
  const [criteria, setCriteria] = useState<FilterCriterion[]>([])
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  })

  const activeCriteria = useMemo(() => criteria.filter((c) => c.value !== undefined && c.value !== null), [criteria])

  const addCriterion = useCallback((criterion: Omit<FilterCriterion, 'id'>) => {
    const id = `criterion-${Date.now()}`
    setCriteria((prev) => [...prev, { ...criterion, id }])
  }, [])

  const removeCriterion = useCallback((id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const updateCriterion = useCallback((id: string, updates: Partial<FilterCriterion>) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  const clearAll = useCallback(() => {
    setCriteria([])
  }, [])

  const savePreset = useCallback(
    (name: string) => {
      const preset: FilterPreset = {
        id: `preset-${Date.now()}`,
        name,
        criteria: activeCriteria,
      }
      setPresets((prev) => {
        const next = [...prev, preset]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
    },
    [activeCriteria],
  )

  const loadPreset = useCallback((presetId: string) => {
    const preset = presets.find((p) => p.id === presetId)
    if (preset) {
      setCriteria(preset.criteria)
    }
  }, [presets])

  const deletePreset = useCallback((presetId: string) => {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== presetId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const applyFilters = useCallback(
    <T,>(data: T[], evaluator: (item: T, criteria: FilterCriterion[]) => boolean): T[] => {
      if (activeCriteria.length === 0) return data
      return data.filter((item) => evaluator(item, activeCriteria))
    },
    [activeCriteria],
  )

  return {
    criteria,
    presets,
    activeCriteria,
    addCriterion,
    removeCriterion,
    updateCriterion,
    clearAll,
    savePreset,
    loadPreset,
    deletePreset,
    applyFilters,
  }
}
