import { useDraggable } from '@dnd-kit/core'
import type React from 'react'
import classes from './Draggable.module.css'

const Draggable = ({
  id,
  children,
  element,
  disabled = false
}: {
  id: string
  children: React.ReactNode
  element?: React.ElementType
  disabled?: boolean
}) => {
  const Element = element || 'div'
  const { isDragging, attributes, listeners, setNodeRef } = useDraggable({
    disabled,
    id
  })

  return (
    <Element
      className={classes.draggable}
      data-dragging={isDragging || undefined}
      data-disabled={disabled || undefined}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      {children}
    </Element>
  )
}
export default Draggable
