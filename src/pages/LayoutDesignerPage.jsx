import { useParams } from 'react-router-dom'
import LayoutDesigner from '@/features/layout-designer/LayoutDesigner'

export default function LayoutDesignerPage() {
  const { layoutId } = useParams()
  return <LayoutDesigner layoutId={layoutId} mode="edit" fullscreen />
}
