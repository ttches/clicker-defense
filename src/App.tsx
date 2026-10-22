import { useRef } from 'react'
import { Stage } from './ui/Stage.tsx'

export const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return <Stage canvasRef={canvasRef} />
}
