import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Eye, Pencil, Copy, LayoutTemplate, Calendar, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { layoutsAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }) {
  const isPublished = status === 'published'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium capitalize',
        isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
      )}
    >
      {status}
    </span>
  )
}

export default function PhaseLayoutsList({ layouts, plotName, phaseName, isLoading }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const duplicateMutation = useMutation({
    mutationFn: (layoutId) => layoutsAPI.duplicate(layoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phase-layouts'] })
    },
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!layouts?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <LayoutTemplate className="h-7 w-7 text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">No Layouts</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          No layouts exist for <strong>{plotName}</strong> › <strong>{phaseName}</strong> yet.
          {isAdmin ? ' Create and publish a layout to get started.' : ' Ask your admin to publish a layout.'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {layouts.map((layout) => (
        <article
          key={layout._id}
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">{layout.name}</h3>
            <StatusBadge status={layout.publishStatus} />
          </div>

          {layout.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{layout.description}</p>
          )}

          <div className="space-y-1.5 text-xs text-slate-500 mb-4 flex-1">
            <div className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-slate-400" />
              <span>Version {layout.version ?? 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Published {formatDate(layout.publishedAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs flex-1 min-w-[100px]"
              disabled={layout.publishStatus !== 'published'}
              onClick={() => navigate(`/layout-viewer/${layout._id}`)}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              View Layout
            </Button>
            {isAdmin && (
              <>
                <Button
                  size="sm"
                  className="h-8 text-xs flex-1 min-w-[100px] bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => navigate(`/layout-designer/${layout._id}`)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit Layout
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  disabled={duplicateMutation.isPending}
                  onClick={() => duplicateMutation.mutate(layout._id)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Duplicate
                </Button>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
