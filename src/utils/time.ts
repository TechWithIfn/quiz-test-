/**
 * Format total seconds into mm:ss or hh:mm:ss format
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  if (mins >= 60) {
    const hrs = Math.floor(mins / 60)
    const remMins = mins % 60
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Human friendly format for test estimates (e.g. "15 mins", "1 hour")
 */
export function formatFriendlyDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min${minutes === 1 ? '' : 's'}`
  }
  const hours = Math.floor(minutes / 60)
  const remMins = minutes % 60
  if (remMins === 0) {
    return `${hours} hr${hours === 1 ? '' : 's'}`
  }
  return `${hours} hr ${remMins} min`
}

/**
 * Format timestamp into local readable date string
 */
export function formatRelativeDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return 'Recent'
  }
}
