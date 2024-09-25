import { useDraggable } from '@dnd-kit/core'
import React from 'react'
import './Draggable.css'

const Draggable = ({ id, children, element, disabled = false }: { id: string; children: any; element?: any; disabled?: boolean }) => {
  const Element = element || 'div'
  const { isDragging, attributes, listeners, setNodeRef } = useDraggable({
    disabled,
    id
  })

  return (
    <Element className={`Draggable ${isDragging ? 'isdragging' : ''} ${disabled ? 'disabled' : ''}`} ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </Element>
  )
}
export default Draggable
