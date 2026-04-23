import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined, currency: string = 'USD'): string {
  if (price == null) return 'Price on Request'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
}

/** Alias for formatDate — full date + time for match display */
export const formatMatchDate = formatDate

/** Short format: "Jun 15 · 3:00 PM" */
export function formatDateShort(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const FLAG_MAP: Record<string, string> = {
  USA: '🇺🇸', MEX: '🇲🇽', CAN: '🇨🇦', BRA: '🇧🇷', ARG: '🇦🇷',
  ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', FRA: '🇫🇷', GER: '🇩🇪', ESP: '🇪🇸', ITA: '🇮🇹',
  POR: '🇵🇹', NED: '🇳🇱', BEL: '🇧🇪', CRO: '🇭🇷', URU: '🇺🇾',
  COL: '🇨🇴', PER: '🇵🇪', ECU: '🇪🇨', VEN: '🇻🇪', PAR: '🇵🇾',
  BOL: '🇧🇴', PAN: '🇵🇦', JAM: '🇯🇲', HON: '🇭🇳', CHL: '🇨🇱',
  MAR: '🇲🇦', NZL: '🇳🇿', AUS: '🇦🇺', JPN: '🇯🇵', KOR: '🇰🇷',
  POL: '🇵🇱', TUR: '🇹🇷', UKR: '🇺🇦', SRB: '🇷🇸', DEN: '🇩🇰',
  AUT: '🇦🇹', CZE: '🇨🇿', QAT: '🇶🇦', SEN: '🇸🇳', CMR: '🇨🇲',
  GHA: '🇬🇭', NGA: '🇳🇬', ALG: '🇩🇿', CIV: '🇨🇮', TUN: '🇹🇳',
  SAU: '🇸🇦', KSA: '🇸🇦', IRN: '🇮🇷', SUI: '🇨🇭',
  RSA: '🇿🇦', EGY: '🇪🇬', HAI: '🇭🇹', CUR: '🇨🇼',
  CPV: '🇨🇻', NOR: '🇳🇴', JOR: '🇯🇴', UZB: '🇺🇿',
  UEPA: '🧩', UEPB: '🧩', UEPC: '🧩', UEPD: '🧩',
  FP01: '🧩', FP02: '🧩',
}

export function getCountryFlag(code: string | null | undefined): string {
  if (!code) return '❔'
  return FLAG_MAP[code] || '❔'
}

/** Alias for getCountryFlag */
export const getFlag = getCountryFlag

export const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Group Stage',
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-Final',
  SF: 'Semi-Final',
  '3RD': '3rd Place',
  FINAL: 'Final',
}

export const CATEGORY_LABELS: Record<number, string> = {
  1: 'Category 1',
  2: 'Category 2',
  3: 'Category 3',
  4: 'Category 4',
}

export const CATEGORY_COLORS: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  2: 'bg-blue-100 text-blue-800 border-blue-300',
  3: 'bg-green-100 text-green-800 border-green-300',
  4: 'bg-gray-100 text-gray-800 border-gray-300',
}

export const CONTACT_URLS: Record<string, (info: string) => string> = {
  whatsapp: (info) => `https://wa.me/${info.replace(/\D/g, '')}`,
  facebook: (info) => {
    if (info.startsWith('http')) {
      try {
        const url = new URL(info)
        const allowed = ['facebook.com', 'www.facebook.com', 'fb.com', 'm.facebook.com', 'www.fb.com']
        if (allowed.includes(url.hostname)) return info
      } catch { /* fall through */ }
    }
    return `https://facebook.com/${info}`
  },
  email: (info) => `mailto:${info}`,
  instagram: (info) => `https://instagram.com/${info.replace('@', '')}`,
}
