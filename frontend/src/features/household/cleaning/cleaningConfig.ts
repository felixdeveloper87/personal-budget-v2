import type { HouseholdCleaningDuty } from '../../../types'

export const CLEANING_DUTIES: ReadonlyArray<{
  key: string
  label: string
  schedule?: string
  timed?: boolean
}> = [
    { key: 'shower_room', label: 'Clean the shower room' },
    { key: 'toilet_wc', label: 'Clean the toilet / WC' },
    { key: 'upstairs_hallway', label: 'Vacuum the upstairs hallway' },
    { key: 'stairs', label: 'Vacuum the stairs' },
    { key: 'downstairs_hallway', label: 'Vacuum the downstairs hallway' },
    { key: 'living_room', label: 'Clean the living room' },
    { key: 'tea_towels', label: 'Wash the tea towels' },
    { key: 'cleaning_cloths', label: 'Wash the cleaning cloths' },
    { key: 'all_bins', label: 'Empty all bins' },
    {
      key: 'rubbish_out',
      label: 'Put the rubbish out',
      schedule: 'Every Thursday · by 10:00',
      timed: true,
    },
  ]

export type DisplayedCleaningDuty = HouseholdCleaningDuty & {
  timed?: boolean
}
