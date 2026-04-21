import { useState } from 'react'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { useMatches } from '@/hooks/useMatches'
import { getCountryFlag, formatDate } from '@/lib/utils'
import type { Database } from '@/lib/database.types'

type Match = Database['public']['Tables']['matches']['Row']

interface MatchSearchProps {
  onSelect: (match: Match) => void
  placeholder?: string
  selectedMatch?: Match | null
}

export default function MatchSearch({ onSelect, placeholder = 'Search matches...', selectedMatch }: MatchSearchProps) {
  const [search, setSearch] = useState('')
  const { data: matches = [], isLoading } = useMatches(search)

  if (selectedMatch) {
    return (
      <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold">
              {getCountryFlag(selectedMatch.team1_code)} {selectedMatch.team1 ?? 'TBD'} vs {selectedMatch.team2 ?? 'TBD'} {getCountryFlag(selectedMatch.team2_code)}
            </span>
            <p className="text-gray-600 text-xs">{selectedMatch.venue} · {formatDate(selectedMatch.match_date)}</p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(selectedMatch)}
            className="text-xs text-blue-600 hover:underline"
          >
            Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <Command className="border rounded-lg" shouldFilter={false}>
      <CommandInput
        placeholder={placeholder}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-64">
        {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
        {!isLoading && matches.length === 0 && <CommandEmpty>No matches found.</CommandEmpty>}
        {matches.length > 0 && (
          <CommandGroup heading="Matches">
            {matches.map(match => (
              <CommandItem
                key={match.id}
                value={match.id}
                onSelect={() => onSelect(match)}
                className="cursor-pointer"
              >
                <div className="flex flex-col gap-0.5 w-full">
                  <span className="font-medium text-sm">
                    {getCountryFlag(match.team1_code)} {match.team1 ?? 'TBD'} vs {match.team2 ?? 'TBD'} {getCountryFlag(match.team2_code)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {match.venue}, {match.city} · {new Date(match.match_date).toLocaleDateString()}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )
}
