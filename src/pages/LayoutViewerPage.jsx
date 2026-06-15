import { useParams } from 'react-router-dom'
import LayoutDesigner from '@/features/layout-designer/LayoutDesigner'

export default function LayoutViewerPage() {
  const { layoutId } = useParams()
  return <LayoutDesigner layoutId={layoutId} mode="view" fullscreen />
}
