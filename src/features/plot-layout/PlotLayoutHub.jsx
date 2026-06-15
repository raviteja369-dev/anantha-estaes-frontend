import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'

import { ChevronRight, Map } from 'lucide-react'

import PlotLayoutTree from './components/PlotLayoutTree'

import PhaseLayoutsList from './components/PhaseLayoutsList'

import CreateLayoutDialog, { CreateLayoutButton } from './components/CreateLayoutDialog'

import { layoutsAPI } from '@/services/api'

import { useAuth } from '@/context/AuthContext'



function Breadcrumb({ items }) {

  return (

    <nav className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">

      {items.map((item, i) => (

        <span key={i} className="flex items-center gap-1.5">

          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}

          <span className={i === items.length - 1 ? 'text-slate-900 font-medium' : ''}>

            {item}

          </span>

        </span>

      ))}

    </nav>

  )

}



export default function PlotLayoutHub() {

  const { isAdmin } = useAuth()

  const [selectedPlot, setSelectedPlot] = useState(null)

  const [selectedPhase, setSelectedPhase] = useState(null)

  const [createOpen, setCreateOpen] = useState(false)



  const { data: phaseData, isLoading } = useQuery({

    queryKey: ['phase-layouts', selectedPhase?._id],

    queryFn: () => layoutsAPI.getByPhase(selectedPhase._id).then((r) => r.data),

    enabled: !!selectedPhase?._id,

  })



  const handlePhaseSelect = ({ plotId, plotName, phase }) => {

    setSelectedPlot({ _id: plotId, name: plotName })

    setSelectedPhase(phase)

  }



  const breadcrumbItems = ['Plot Layout']

  if (selectedPlot) breadcrumbItems.push(selectedPlot.name)

  if (selectedPhase) breadcrumbItems.push(selectedPhase.name)



  const layouts = phaseData?.layouts || []

  const showLayouts = !!selectedPhase



  return (

    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden bg-slate-50">

      <PlotLayoutTree

        selectedPlotId={selectedPlot?._id}

        selectedPhaseId={selectedPhase?._id}

        onPhaseSelect={handlePhaseSelect}

      />



      <div className="flex flex-1 flex-col min-w-0">

        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">

          <Breadcrumb items={breadcrumbItems} />

          {isAdmin && <CreateLayoutButton onClick={() => setCreateOpen(true)} />}

        </header>



        <main className="flex-1 overflow-y-auto p-6">

          {showLayouts ? (

            <div>

              <div className="mb-6">

                <h2 className="text-lg font-semibold text-slate-900">Layouts</h2>

                <p className="text-sm text-slate-500 mt-1">

                  {selectedPlot?.name} › {selectedPhase?.name} — select a layout to view{isAdmin ? ' or edit' : ''}

                </p>

              </div>

              <PhaseLayoutsList

                layouts={layouts}

                plotName={selectedPlot?.name}

                phaseName={selectedPhase?.name}

                isLoading={isLoading}

              />

              {isAdmin && !isLoading && !layouts.length && (

                <div className="mt-6 flex justify-center">

                  <CreateLayoutButton onClick={() => setCreateOpen(true)} />

                </div>

              )}

            </div>

          ) : (

            <div className="flex h-full items-center justify-center">

              <div className="max-w-lg text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                  <Map className="h-8 w-8 text-slate-400" />

                </div>

                <h3 className="text-lg font-semibold text-slate-900">Select a Phase</h3>

                <p className="mt-2 text-sm text-slate-500 leading-relaxed">

                  Expand a project in the sidebar and click a phase to browse its layouts.

                </p>

                <div className="mt-6 flex flex-col gap-2 text-left rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">

                  <p className="font-medium text-slate-800">How it works</p>

                  <ol className="list-decimal list-inside space-y-1 text-slate-500">

                    <li>Browse projects in the left panel</li>

                    <li>Expand a project to see its phases</li>

                    <li>Click a phase to see layouts</li>

                    <li>Open a published layout to view plots and book</li>

                  </ol>

                </div>

              </div>

            </div>

          )}

        </main>

      </div>



      {isAdmin && (

        <CreateLayoutDialog

          open={createOpen}

          onOpenChange={setCreateOpen}

          defaultProjectId={selectedPlot?._id}

          defaultPhaseId={selectedPhase?._id}

        />

      )}

    </div>

  )

}


