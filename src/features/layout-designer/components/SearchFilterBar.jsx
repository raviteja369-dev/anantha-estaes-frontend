import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useLayoutStore from '../store/layoutStore'
import { PLOT_STATUS_COLORS } from '../constants'

export default function SearchFilterBar({ phases, employees, projects, selectedProject, onProjectChange }) {
  const { filters, setFilters } = useLayoutStore()

  return (
    <div className="designer-ui flex items-center gap-2 flex-wrap glass-panel rounded-xl border border-white/10 px-3 py-2 shadow-lg text-slate-200">
      <Select value={selectedProject} onValueChange={onProjectChange}>
        <SelectTrigger className="w-44 h-8 text-xs bg-slate-900/80 border-white/15 text-slate-100"><SelectValue placeholder="Project" /></SelectTrigger>
        <SelectContent>
          {projects?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          className="pl-8 h-8 w-40 text-xs bg-slate-900/80 border-white/15 text-slate-100 placeholder:text-slate-500"
          placeholder="Plot, customer..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
        />
      </div>

      <Select value={filters.status || 'all'} onValueChange={(v) => setFilters({ status: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-32 h-8 text-xs bg-slate-900/80 border-white/15 text-slate-100"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(PLOT_STATUS_COLORS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.phase || 'all'} onValueChange={(v) => setFilters({ phase: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-28 h-8 text-xs bg-slate-900/80 border-white/15 text-slate-100"><SelectValue placeholder="Phase" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Phases</SelectItem>
          {phases?.map((p) => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.employee || 'all'} onValueChange={(v) => setFilters({ employee: v === 'all' ? '' : v })}>
        <SelectTrigger className="w-32 h-8 text-xs bg-slate-900/80 border-white/15 text-slate-100"><SelectValue placeholder="Employee" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Employees</SelectItem>
          {employees?.map((e) => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}
