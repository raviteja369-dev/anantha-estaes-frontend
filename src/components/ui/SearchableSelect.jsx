import { useState, useMemo, useRef, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Searchable dropdown — select only from provided options (no free text).
 */
export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  getOptionLabel = (opt) => opt.label ?? opt.name ?? String(opt),
  getOptionValue = (opt) => opt.value ?? opt._id ?? opt.id,
  disabled = false,
  required = false,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  const selected = options.find((o) => String(getOptionValue(o)) === String(value))

  const filtered = useMemo(() => {
    if (!search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((o) => getOptionLabel(o).toLowerCase().includes(q))
  }, [options, search, getOptionLabel])

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full justify-between h-10 font-normal',
          !value && 'text-muted-foreground'
        )}
      >
        <span className="truncate">{selected ? getOptionLabel(selected) : placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 rounded-md border border-border pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-500">No results</li>
            ) : (
              filtered.map((opt) => {
                const optValue = getOptionValue(opt)
                const isSelected = String(optValue) === String(value)
                return (
                  <li key={optValue}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left hover:bg-slate-50',
                        isSelected && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => {
                        onChange(optValue)
                        setOpen(false)
                        setSearch('')
                      }}
                    >
                      <Check className={cn('h-4 w-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                      <span className="truncate">{getOptionLabel(opt)}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
      {required && !value && (
        <input tabIndex={-1} className="sr-only" required value="" onChange={() => {}} />
      )}
    </div>
  )
}
