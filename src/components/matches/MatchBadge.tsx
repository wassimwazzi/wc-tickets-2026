import { MapPin, Calendar } from 'lucide-react'
import { getCountryFlag, formatDate } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

type Match = Database['public']['Tables']['matches']['Row']

const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Group Stage',
  R32: 'Round of 32',
  R16: 'Round of 16',
  QF: 'Quarter-Final',
  SF: 'Semi-Final',
  '3RD': '3rd Place',
  FINAL: 'Final',
}

const STAGE_COLORS: Record<string, string> = {
  GROUP: 'bg-blue-100 text-blue-800',
  R32: 'bg-green-100 text-green-800',
  R16: 'bg-yellow-100 text-yellow-800',
  QF: 'bg-orange-100 text-orange-800',
  SF: 'bg-red-100 text-red-800',
  '3RD': 'bg-purple-100 text-purple-800',
  FINAL: 'bg-yellow-400 text-yellow-900 font-bold',
}

interface MatchBadgeProps {
  match: Match
  compact?: boolean
}

export default function MatchBadge({ match, compact = false }: MatchBadgeProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[match.stage] ?? 'bg-gray-100 text-gray-700'}`}>
          {STAGE_LABELS[match.stage] ?? match.stage}
          {match.group_name && ` · Group ${match.group_name}`}
        </span>
        <span className="text-xs text-gray-500">Match #{match.match_number}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="text-lg">{getCountryFlag(match.team1_code)}</span>
          <span className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
            {match.team1 ?? 'TBD'}
          </span>
        </div>

        <div className="text-xs font-bold text-gray-500 px-2">VS</div>

        <div className="flex items-center gap-2 flex-1">
          <span className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
            {match.team2 ?? 'TBD'}
          </span>
          <span className="text-lg">{getCountryFlag(match.team2_code)}</span>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col gap-1 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span>{match.venue}, {match.city}, {match.country}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{formatDate(match.match_date)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
