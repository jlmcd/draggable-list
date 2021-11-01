import React, { useState, useEffect, useMemo, useCallback } from 'react';

const POSITION = { x: 0, y: 0 }

const DraggableListItem = ({ children, onDrag, onDragEnd, child, axis }) => {
  const [state, setState] = useState({
    isDragging: false,
    origin: POSITION,
    translation: POSITION
  })
  
  const handleMouseDown = useCallback(({ clientX, clientY }) => {
    setState(state => ({
      ...state,
      isDragging: true,
      origin: { x: clientX, y: clientY }
    }))
  }, [])

  const handleMouseMove = useCallback(({ clientX, clientY }) => {
    const translation = { x: clientX - state.origin.x, y: clientY - state.origin.y }
    if (axis === 'y') translation.x = 0;
    if (axis === 'x') translation.y = 0;

    setState(state => ({
      ...state,
      translation
    }))
    onDrag({translation, selectedItem: child})
  }, [state.origin, onDrag, child, axis])

  const handleMouseUp = useCallback(() => {
    setState(state => ({
      ...state,
      isDragging: false
    }))
    onDragEnd()
  }, [onDragEnd])

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)

      setState(state => ({ ...state, translation: POSITION }))
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp])

  const styles = useMemo(() => ({
    cursor: state.isDragging ? 'grabbing' : 'grab',
    transform: `translate(${state.translation.x}px, ${state.translation.y}px)`,
    transition: state.isDragging ? null : '.5s',
    zIndex: state.isDragging ? 2 : 0,
    position: state.isDragging ? 'absolute' : 'relative'
  }), [state.isDragging, state.translation])

  return (
    <div
      className="draggable-list__item--drag-handler"
      style={styles}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}

export default DraggableListItem;