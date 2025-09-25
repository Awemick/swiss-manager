import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRating(rating: number | null): string {
  if (!rating) return '-'
  return rating.toString()
}

export function calculatePerformance(score: number, opponents: number[]): number {
  if (opponents.length === 0) return 0
  const avgOpponent = opponents.reduce((a, b) => a + b, 0) / opponents.length
  return Math.round(avgOpponent + (score - opponents.length * 0.5) * 20)
}

export function getTitleAbbreviation(title: string | null): string {
  const titles: { [key: string]: string } = {
    'GM': 'GM', 'IM': 'IM', 'FM': 'FM', 'CM': 'CM',
    'WGM': 'WGM', 'WIM': 'WIM', 'WFM': 'WFM', 'WCM': 'WCM',
    'NM': 'NM'
  }
  return title ? titles[title] || title : ''
}