import { motion } from 'framer-motion'
import { User, Compass, Ruler, IndianRupee, Building2, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, PLOT_STATUS } from '@/lib/utils'

export default function PlotDetailsPanel({ plot, onViewDetails }) {
  if (!plot) {
    return (
      <Card className="glass">
        <CardContent className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Select a plot to view details</p>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = PLOT_STATUS[plot.status]

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="glass overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Plot {plot.plotNumber}</CardTitle>
            <Badge variant={plot.status === 'available' ? 'success' : plot.status === 'reserved' ? 'warning' : plot.status === 'sold' ? 'destructive' : 'info'}>
              {statusInfo?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: Ruler, label: 'Plot Size', value: `${plot.size} sqft` },
            { icon: IndianRupee, label: 'Price', value: formatCurrency(plot.cost) },
            { icon: Compass, label: 'Facing', value: plot.facing },
            { icon: Layers, label: 'Block', value: plot.phase?.name || '—' },
            { icon: Building2, label: 'Project', value: plot.project?.name || '—' },
            { icon: User, label: 'Customer', value: plot.customer?.name || '—' },
            { icon: User, label: 'Employee', value: plot.assignedEmployee?.name || '—' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 text-sm">
              <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground w-24">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
          {plot.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{plot.notes}</p>
            </div>
          )}
          <Button className="w-full mt-2" onClick={() => onViewDetails?.(plot)}>
            View Full Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
