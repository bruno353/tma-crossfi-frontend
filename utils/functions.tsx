'use client'
import { formatDistanceToNow } from 'date-fns'

export function formatDeadline(timestamp) {
  console.log(timestamp)
  if (timestamp) {
    const date = new Date(timestamp)
    let difference = formatDistanceToNow(date)

    difference = `${difference.charAt(0).toUpperCase()}${difference.slice(
      1,
    )} ago`
    return difference
  } else {
    return ''
  }
}
