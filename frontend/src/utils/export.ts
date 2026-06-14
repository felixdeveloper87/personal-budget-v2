import { exportAllUserData } from '../api'
import { downloadBlob } from './csv'

/**
 * Downloads one CSV containing every user-owned data set.
 */
export async function exportAllData(): Promise<void> {
  const stamp = new Date().toISOString().slice(0, 10)
  const csv = await exportAllUserData()
  downloadBlob(`personal-budget-data-${stamp}.csv`, csv)
}
