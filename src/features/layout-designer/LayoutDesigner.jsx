import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { layoutsAPI, phasesAPI, employeesAPI, plotsAPI, customersAPI } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { canManageBooking } from '@/lib/utils'
import useLayoutStore from './store/layoutStore'
import DesignerCanvas from './components/DesignerCanvas'
import DesignerTopBar from './components/DesignerTopBar'
import DesignerToolbox from './components/DesignerToolbox'
import DesignerRightPanel from './components/DesignerRightPanel'
import QuickActionBar from './components/QuickActionBar'
import CanvasOnboarding from './components/CanvasOnboarding'
import DesignerStatusBar from './components/DesignerStatusBar'
import PlotCreateDialog from './components/PlotCreateDialog'
import CreateLayoutDialog from '@/features/plot-layout/components/CreateLayoutDialog'
import Minimap from './components/Minimap'
import PlotTooltip from './components/PlotTooltip'
import ViewerPlotDrawer from './components/ViewerPlotDrawer'
import PlotStatusLegend from './components/PlotStatusLegend'
import BookingFormDialog from '@/components/bookings/BookingFormDialog'
import { exportStageImage, exportStagePdf, downloadDataUrl } from './utils/export'
import PageLoader from '@/components/shared/PageLoader'
import PlotFormDialog from '@/components/plots/PlotFormDialog'

export default function LayoutDesigner({ layoutId, mode = 'edit', fullscreen = true }) {
  const viewMode = mode === 'view'
  const { user, isAdmin, employeeId } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const stageRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const importInputRef = useRef(null)
  const loadedLayoutRef = useRef(null)
  const fittedRef = useRef(false)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 })
  const [editPlot, setEditPlot] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [bookingPlot, setBookingPlot] = useState(null)
  const [bookingFormOpen, setBookingFormOpen] = useState(false)

  const {
    initLayout, getLayoutPayload, setProjectId, setPhaseId, syncPlotStatuses,
    readOnly, deleteSelected, copySelected, pasteClipboard, undo, redo,
    setDirty, setSaving, dirty, setActiveTool, fitToContent, importElements,
    pendingPlotId, setPendingPlotId, projectId,
  } = useLayoutStore()

  const elements = useLayoutStore((s) => s.elements)
  const selectedIds = useLayoutStore((s) => s.selectedIds)
  const saving = useLayoutStore((s) => s.saving)

  const { data: layoutData, isLoading } = useQuery({
    queryKey: ['layout', layoutId],
    queryFn: () => layoutsAPI.getById(layoutId).then((r) => r.data),
    enabled: !!layoutId,
    staleTime: 60000,
  })

  const selectedProject = layoutData?.projectId || projectId

  const { data: phases } = useQuery({
    queryKey: ['phases', selectedProject],
    queryFn: () => phasesAPI.getByProject(selectedProject).then((r) => r.data),
    enabled: !!selectedProject && !viewMode,
  })

  const { data: livePlots } = useQuery({
    queryKey: ['plots', selectedProject, layoutData?.phaseId, viewMode ? 'view' : 'designer'],
    queryFn: () => plotsAPI.getAll({
      project: selectedProject,
      phase: layoutData?.phaseId,
      ...(viewMode ? {} : { scope: 'designer' }),
    }).then((r) => r.data),
    enabled: !!selectedProject && !!layoutData?.phaseId,
    refetchInterval: viewMode ? 10000 : 30000,
  })

  const { data: employees } = useQuery({
    queryKey: ['employees-dropdown'],
    queryFn: () => employeesAPI.getDropdown().then((r) => r.data),
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersAPI.getAll().then((r) => r.data),
  })

  useEffect(() => {
    if (!layoutData || !layoutId) return
    if (loadedLayoutRef.current === layoutId) return
    loadedLayoutRef.current = layoutId
    fittedRef.current = false
    initLayout(
      { ...layoutData, layoutId },
      viewMode ? { viewerMode: true, readOnly: true } : { readOnly: false, viewerMode: false }
    )
    setProjectId(layoutData.projectId)
    if (layoutData.phaseId) setPhaseId(layoutData.phaseId)
    if (layoutData.plots) syncPlotStatuses(layoutData.plots, layoutData.phaseId)
  }, [layoutData, layoutId, viewMode, initLayout, setProjectId, setPhaseId, syncPlotStatuses])

  useEffect(() => {
    if (fittedRef.current || canvasSize.w < 10) return
    if (elements.length > 0 && loadedLayoutRef.current === layoutId) {
      fitToContent(canvasSize.w, canvasSize.h)
      fittedRef.current = true
    }
  }, [canvasSize, layoutId, fitToContent, elements.length])

  useEffect(() => {
    if (livePlots?.length) syncPlotStatuses(livePlots, layoutData?.phaseId)
  }, [livePlots, layoutData?.phaseId, syncPlotStatuses])

  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return
    const update = () => setCanvasSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const saveMutation = useMutation({
    mutationFn: (payload) => layoutsAPI.save(layoutId, payload),
    onSuccess: () => {
      setDirty(false)
      setSaving(false)
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      queryClient.invalidateQueries({ queryKey: ['layout', layoutId] })
      queryClient.invalidateQueries({ queryKey: ['phase-layouts'] })
    },
    onError: (err) => {
      setSaving(false)
      console.error('Save failed:', err.response?.data?.message || err.message)
    },
  })

  const handleSave = useCallback(() => {
    if (!isAdmin || !layoutId || viewMode || saveMutation.isPending) return
    setSaving(true)
    saveMutation.mutate(getLayoutPayload())
  }, [isAdmin, layoutId, viewMode, saveMutation, setSaving, getLayoutPayload])

  const handlePublish = useCallback(() => {
    if (!isAdmin || !layoutId || viewMode || saveMutation.isPending) return
    setSaving(true)
    saveMutation.mutate(
      { ...getLayoutPayload(), publishStatus: 'published' },
      {
        onSuccess: () => {
          navigate(isAdmin ? '/plot-layout' : '/employee/plot-layout')
        },
      }
    )
  }, [isAdmin, layoutId, viewMode, saveMutation, setSaving, getLayoutPayload, navigate])

  useEffect(() => {
    if (!isAdmin || readOnly || viewMode) return
    const interval = setInterval(() => {
      if (useLayoutStore.getState().dirty) handleSave()
    }, 30000)
    return () => clearInterval(interval)
  }, [isAdmin, readOnly, viewMode, handleSave])

  const handleExport = async (format) => {
    const title = layoutData?.name || layoutData?.phase?.project?.name || 'Site Layout'
    if (format === 'pdf') {
      await exportStagePdf(stageRef, title)
    } else {
      const uri = await exportStageImage(stageRef, format)
      if (uri) downloadDataUrl(uri, `layout.${format}`)
    }
  }

  const handleImportClick = () => importInputRef.current?.click()

  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        const imported = data.elements || data
        if (Array.isArray(imported)) {
          importElements(imported)
          fitToContent(canvasSize.w, canvasSize.h)
        }
      } catch {
        console.error('Invalid layout file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleKeyDown = useCallback((e) => {
    if (viewMode) {
      if (e.key === 'h' || e.key === 'H') setActiveTool('hand')
      return
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected() }
    if (e.key === 'v' || e.key === 'V') setActiveTool('select')
    if (e.key === 'h' || e.key === 'H') setActiveTool('hand')
    if (e.key === 'p' || e.key === 'P') setActiveTool('plot')
    if (e.key === 'r' || e.key === 'R') setActiveTool('road')
    if (e.key === 'k' || e.key === 'K') setActiveTool('park')
    if (e.key === 'e' || e.key === 'E') setActiveTool('trees')
    if (e.key === 'a' || e.key === 'A') setActiveTool('amenity')
    if (e.key === 't' || e.key === 'T') setActiveTool('text')
    if (e.key === 'm' || e.key === 'M') setActiveTool('marker')
    if (e.ctrlKey && e.key === 'c') { e.preventDefault(); copySelected() }
    if (e.ctrlKey && e.key === 'v') { e.preventDefault(); pasteClipboard() }
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo() }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo() }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); handleSave() }
  }, [viewMode, deleteSelected, copySelected, pasteClipboard, undo, redo, handleSave, setActiveTool])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const bookPlotMutation = useMutation({
    mutationFn: ({ id, data }) => plotsAPI.createBooking(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['layout', layoutId] })
      setBookingFormOpen(false)
      setBookingPlot(null)
    },
  })

  const statusUpdateMutation = useMutation({
    mutationFn: ({ id, status }) => plotsAPI.updateBookingStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['layout', layoutId] })
    },
  })

  const updatePlotMutation = useMutation({
    mutationFn: ({ id, data }) => plotsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      setDialogOpen(false)
    },
  })

  const handleBookPlot = (plot) => {
    if (!plot.active) return
    if (plot.status !== 'available') return
    setBookingPlot(plot)
    setBookingFormOpen(true)
  }

  const handleConfirmBooking = (data) => {
    if (!bookingPlot) return
    bookPlotMutation.mutate({ id: bookingPlot._id, data })
  }

  const handleUpdateBookingStatus = (plotId, status) => {
    statusUpdateMutation.mutate({ id: plotId, status })
  }

  const selectedEl = elements.find((e) => e.id === selectedIds[0] && e.type === 'plot')
  const selectedPlotForPerm = (() => {
    const meta = selectedEl?.metadata || {}
    return livePlots?.find(
      (p) => String(p._id) === String(meta.plotId)
        || (meta.plotNumber && p.plotNumber === meta.plotNumber
          && String(p.phase?._id || p.phase) === String(layoutData?.phaseId))
    ) || layoutData?.plots?.find(
      (p) => String(p._id) === String(meta.plotId)
        || (meta.plotNumber && p.plotNumber === meta.plotNumber)
    )
  })()
  const canUpdateStatus = selectedPlotForPerm
    ? canManageBooking(user, selectedPlotForPerm, employeeId)
    : false

  const plotName = layoutData?.phase?.project?.name
  const phaseName = layoutData?.phase?.name
  const layoutLabel = layoutData?.name
  const breadcrumb = plotName && phaseName
    ? ['Plot Layout', plotName, phaseName, layoutLabel || `v${layoutData?.version || 1}`].filter(Boolean)
    : ['Plot Layout', layoutLabel].filter(Boolean)

  const backPath = isAdmin ? '/plot-layout' : '/employee/plot-layout'

  if (isLoading || !layoutId) return <PageLoader />

  return (
    <div className={`flex flex-col bg-slate-100 ${fullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-8rem)]'} overflow-hidden`}>
      {!viewMode && (
        <input ref={importInputRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
      )}

      <DesignerTopBar
        projectName={plotName}
        layoutName={layoutData?.name}
        breadcrumb={breadcrumb}
        viewMode={viewMode}
        onBack={() => navigate(backPath)}
        onSave={handleSave}
        onPublish={handlePublish}
        onExport={() => handleExport('png')}
        onImport={viewMode ? undefined : handleImportClick}
        onCreateLayout={!viewMode && isAdmin ? () => setCreateOpen(true) : undefined}
        onEditLayout={viewMode && isAdmin ? () => navigate(`/layout-designer/${layoutId}`) : undefined}
        saving={saving || saveMutation.isPending}
        readOnly={readOnly}
      />

      <div className="flex flex-1 min-h-0">
        {!viewMode && <DesignerToolbox />}

        <div className="flex flex-1 flex-col min-w-0">
          {!viewMode && <QuickActionBar canvasWidth={canvasSize.w} canvasHeight={canvasSize.h} />}

          <div ref={canvasContainerRef} className="relative flex-1 min-h-0 overflow-hidden">
            {viewMode && <PlotStatusLegend />}
            <DesignerCanvas width={canvasSize.w} height={canvasSize.h} stageRef={stageRef} />
            {viewMode && (
              <ViewerPlotDrawer
                livePlots={livePlots}
                layoutPlots={layoutData?.plots}
                phaseId={layoutData?.phaseId}
                layoutName={layoutData?.name}
                phaseName={phaseName}
                projectName={plotName}
                onBookPlot={handleBookPlot}
                canUpdateStatus={canUpdateStatus}
                onUpdateStatus={handleUpdateBookingStatus}
                updatingStatus={statusUpdateMutation.isPending}
              />
            )}
            {!viewMode && (
              <>
                <CanvasOnboarding onImport={handleImportClick} canvasWidth={canvasSize.w} canvasHeight={canvasSize.h} />
                <Minimap canvasWidth={canvasSize.w} canvasHeight={canvasSize.h} />
                <PlotTooltip />
              </>
            )}
          </div>

          <DesignerStatusBar viewMode={viewMode} />
        </div>

        {!viewMode && <DesignerRightPanel phases={phases} />}
      </div>

      {!viewMode && (
        <>
          <PlotCreateDialog plotId={pendingPlotId} phases={phases} onClose={() => setPendingPlotId(null)} />
          <CreateLayoutDialog
            open={createOpen}
            onOpenChange={setCreateOpen}
            defaultProjectId={layoutData?.projectId}
            defaultPhaseId={layoutData?.phaseId}
          />
          <PlotFormDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            plot={editPlot}
            projects={layoutData?.phase?.project ? [layoutData.phase.project] : []}
            phases={phases}
            employees={employees}
            customers={customers}
            onSubmit={(data) => updatePlotMutation.mutate({ id: editPlot._id, data })}
            loading={updatePlotMutation.isPending}
          />
        </>
      )}

      {viewMode && (
        <BookingFormDialog
          open={bookingFormOpen}
          onOpenChange={setBookingFormOpen}
          plot={bookingPlot}
          layoutName={layoutData?.name}
          projectName={plotName}
          phaseName={phaseName}
          customers={customers}
          employees={employees}
          onSubmit={handleConfirmBooking}
          loading={bookPlotMutation.isPending}
        />
      )}
    </div>
  )
}
