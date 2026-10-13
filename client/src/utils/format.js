const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

// "5 minutes ago", "yesterday", "2 weeks ago"
export const timeAgo = (date) => {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit)
    }
  }
  return 'just now'
}

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

export const isToday = (date) => new Date(date).toDateString() === new Date().toDateString()

// "Ravi Kumar" -> "RK"
export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'
