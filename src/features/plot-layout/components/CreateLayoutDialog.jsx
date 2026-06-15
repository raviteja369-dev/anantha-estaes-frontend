import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Map, LayoutTemplate } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { projectsAPI, phasesAPI, layoutsAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'

export default function CreateLayoutDialog({ open, onOpenChange, defaultProjectId, defaultPhaseId, onCreated }) {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [projectId, setProjectId] = useState(defaultProjectId || '')
  const [phaseId, setPhaseId] = useState(defaultPhaseId || '')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) {
      setProjectId(defaultProjectId || '')
      setPhaseId(defaultPhaseId || '')
      setName('')
      setDescription('')
    }
  }, [open, defaultProjectId, defaultPhaseId])

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then((r) => r.data),
    enabled: open && isAdmin,
  })

  const { data: phases } = useQuery({
    queryKey: ['phases', projectId],
    queryFn: () => phasesAPI.getByProject(projectId).then((r) => r.data),
    enabled: open && !!projectId,
  })

  useEffect(() => {
    if (phases?.length && !phaseId) setPhaseId(phases[0]._id)
  }, [phases, phaseId])

  useEffect(() => {
    if (projectId && phases?.length) {
      const phase = phases.find((p) => p._id === phaseId)
      const project = projects?.find((p) => p._id === projectId)
      if (phase && project && !name) {
        setName(`${project.name} — ${phase.name}`)
      }
    }
  }, [projectId, phaseId, phases, projects, name])

  const createMutation = useMutation({
    mutationFn: (data) => layoutsAPI.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['phase-layouts'] })
      onOpenChange(false)
      const layoutId = res.data.layout._id
      if (onCreated) onCreated(layoutId)
      else navigate(`/layout-designer/${layoutId}`)
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!projectId || !phaseId) return
    createMutation.mutate({ projectId, phaseId, name: name.trim(), description: description.trim() })
  }

  if (!isAdmin) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-indigo-600" />
            Create Layout
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value); setPhaseId('') }}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
            >
              <option value="">Select project</option>
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phase">Phase</Label>
            <select
              id="phase"
              value={phaseId}
              onChange={(e) => setPhaseId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20"
              required
              disabled={!projectId}
            >
              <option value="">Select phase</option>
              {phases?.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Layout Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anantha Valley — Phase 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this layout"
              rows={3}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {createMutation.isError && (
            <p className="text-sm text-red-600">
              {createMutation.error?.response?.data?.message || 'Failed to create layout'}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create Layout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateLayoutButton({ onClick, className }) {
  return (
    <Button onClick={onClick} className={className || 'bg-indigo-600 hover:bg-indigo-700 shadow-sm'}>
      <Plus className="h-4 w-4 mr-1.5" />
      Create Layout
    </Button>
  )
}
