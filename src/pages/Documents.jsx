import { useQuery } from '@tanstack/react-query'
import { FileText, Download } from 'lucide-react'
import { plotsAPI } from '@/services/api'
import PageLoader from '@/components/shared/PageLoader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Documents() {
  const { data: plots, isLoading } = useQuery({
    queryKey: ['plots-with-docs'],
    queryFn: () => plotsAPI.getAll().then((r) => r.data.filter((p) => p.documents?.length > 0)),
  })

  if (isLoading) return <PageLoader />

  const allDocs = plots?.flatMap((plot) =>
    (plot.documents || []).map((doc) => ({ ...doc, plotNumber: plot.plotNumber, plotId: plot._id }))
  ) || []

  return (
    <div className="space-y-4">
      {allDocs.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No documents uploaded yet</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allDocs.map((doc, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">Plot {doc.plotNumber}</p>
                  <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString('en-IN')}</p>
                </div>
                <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
