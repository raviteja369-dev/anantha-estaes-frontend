import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const colorMap = {
  default: 'from-primary/10 to-primary/5 border-primary/20',
  green: 'from-green-500/10 to-green-500/5 border-green-500/20',
  orange: 'from-orange-500/10 to-orange-500/5 border-orange-500/20',
  red: 'from-red-500/10 to-red-500/5 border-red-500/20',
  blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
  purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
}

const iconColorMap = {
  default: 'text-primary bg-primary/10',
  green: 'text-green-600 bg-green-500/10',
  orange: 'text-orange-600 bg-orange-500/10',
  red: 'text-red-600 bg-red-500/10',
  blue: 'text-blue-600 bg-blue-500/10',
  purple: 'text-purple-600 bg-purple-500/10',
}

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'default', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 shadow-sm hover:shadow-md transition-shadow duration-300',
        colorMap[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', iconColorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </motion.div>
  )
}
