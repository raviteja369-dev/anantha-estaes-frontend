import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import { projectsAPI, phasesAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import PageLoader from '@/components/shared/PageLoader'
import { motion } from 'framer-motion'

function getNextPhaseName(existingPhases = []) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const used = new Set(
    existingPhases.map((p) => p.name?.match(/phase\s*([a-z])/i)?.[1]?.toUpperCase()).filter(Boolean)
  )
  for (const letter of letters) {
    if (!used.has(letter)) return `Phase ${letter}`
  }
  return `Phase ${existingPhases.length + 1}`
}

export default function Projects() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [phaseDialog, setPhaseDialog] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', location: '', totalArea: '' })
  const [phaseName, setPhaseName] = useState('')
  const [phaseError, setPhaseError] = useState('')

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll().then((r) => r.data),
  })

  const { data: allPhases = [] } = useQuery({
    queryKey: ['all-phases'],
    queryFn: async () => {
      const projs = await projectsAPI.getAll().then((r) => r.data)
      const grouped = await Promise.all(
        projs.map((p) =>
          phasesAPI.getByProject(p._id).then((r) =>
            r.data.map((phase) => ({ ...phase, projectId: p._id }))
          )
        )
      )
      return grouped.flat()
    },
    enabled: !!projects?.length,
  })

  const phasesByProject = (projectId) =>
    allPhases.filter((p) => String(p.project) === String(projectId) || String(p.projectId) === String(projectId))

  const createMutation = useMutation({
    mutationFn: (data) => projectsAPI.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setDialogOpen(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['projects'] }); setDialogOpen(false); setEditProject(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => projectsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['all-phases'] })
    },
  })

  const createPhaseMutation = useMutation({
    mutationFn: (data) => phasesAPI.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['all-phases'] })
      queryClient.invalidateQueries({ queryKey: ['phases', variables.project] })
      queryClient.invalidateQueries({ queryKey: ['phases'] })
      setPhaseDialog(false)
      setPhaseName('')
      setPhaseError('')
      setSelectedProject(null)
    },
    onError: (err) => {
      setPhaseError(err.response?.data?.message || 'Failed to save phase. Please try again.')
    },
  })

  const deletePhaseMutation = useMutation({
    mutationFn: (id) => phasesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-phases'] })
      queryClient.invalidateQueries({ queryKey: ['phases'] })
    },
  })

  const openCreate = () => {
    setEditProject(null)
    setForm({ name: '', description: '', location: '', totalArea: '' })
    setDialogOpen(true)
  }

  const openEdit = (project) => {
    setEditProject(project)
    setForm({ name: project.name, description: project.description, location: project.location, totalArea: project.totalArea })
    setDialogOpen(true)
  }

  const openPhaseDialog = (project) => {
    const existing = phasesByProject(project._id)
    setSelectedProject(project)
    setPhaseName(getNextPhaseName(existing))
    setPhaseError('')
    setPhaseDialog(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    editProject ? updateMutation.mutate({ id: editProject._id, data: form }) : createMutation.mutate(form)
  }

  const handlePhaseSubmit = (e) => {
    e.preventDefault()
    const name = phaseName.trim()
    if (!name) {
      setPhaseError('Phase name is required')
      return
    }
    if (!selectedProject?._id) {
      setPhaseError('No project selected')
      return
    }
    setPhaseError('')
    createPhaseMutation.mutate({ name, project: selectedProject._id })
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">Manage your real estate projects and phases</p>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project, i) => {
          const projectPhases = phasesByProject(project._id)
          return (
            <motion.div key={project._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-lg transition-shadow duration-300 group">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.location}</p>
                    </div>
                  </div>
                  <Badge variant="success">{project.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description || 'No description'}</p>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Phases ({projectPhases.length})
                    </p>
                    {projectPhases.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {projectPhases.map((phase) => (
                          <Badge key={phase._id} variant="outline" className="text-xs gap-1 pr-1">
                            {phase.name}
                            <button
                              type="button"
                              className="ml-1 text-muted-foreground hover:text-destructive"
                              onClick={() => deletePhaseMutation.mutate(phase._id)}
                              title="Delete phase"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No phases yet</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(project)}><Pencil className="h-3 w-3" /> Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => openPhaseDialog(project)}>+ Phase</Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteMutation.mutate(project._id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editProject ? 'Edit Project' : 'New Project'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div><Label>Total Area</Label><Input value={form.totalArea} onChange={(e) => setForm({ ...form, totalArea: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editProject ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={phaseDialog} onOpenChange={(open) => { setPhaseDialog(open); if (!open) { setPhaseError(''); setSelectedProject(null) } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Phase to {selectedProject?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handlePhaseSubmit} className="space-y-4">
            <div>
              <Label>Phase Name</Label>
              <Input
                value={phaseName}
                onChange={(e) => { setPhaseName(e.target.value); setPhaseError('') }}
                placeholder="Phase A"
                required
                autoFocus
              />
            </div>
            {phaseError && <p className="text-sm text-destructive">{phaseError}</p>}
            <Button type="submit" className="w-full" disabled={createPhaseMutation.isPending}>
              {createPhaseMutation.isPending ? 'Saving...' : 'Add Phase'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
