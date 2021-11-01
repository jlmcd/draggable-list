import React, { useState, useCallback, useRef } from "react";
import { useEffect } from "react";
import DraggableListItem from './DraggableListItem';

export default function DraggableList({ axis, children, dragEnd, listData }) {
  const [state, setState] = useState({
    childrenOrder: children,
    childrenDragOrder: children,
    listData: listData.map((item, i) => ({ item, nodeKey: children[i].key })),
    draggedIndex: null,
    length: 0
  });

  const listItem = useRef()

  const handleDrag = useCallback(({ translation, selectedItem }) => {
    const delta = axis === 'x' ? Math.round(translation.x / state.length) : Math.round(translation.y / state.length)
    const selectedItemIndex = state.childrenOrder.findIndex(item => item.key === selectedItem.key)

    const childrenDragOrder = state.childrenOrder.filter(item => item !== selectedItem)

    if (selectedItemIndex + delta < 0 || selectedItemIndex + delta >= state.childrenOrder.length) {
      return;
    }

    childrenDragOrder.splice(selectedItemIndex + delta, 0, selectedItem);

    setState(state => ({
      ...state,
      draggedIndex: selectedItemIndex,
      childrenDragOrder,
    }))
  }, [axis, state.childrenOrder, state.length])

  const handleDragEnd = () => {
    let listData;
    setState(state => {
      listData = state.childrenDragOrder.map(node => state.listData.find(el => el.nodeKey === node.key))
      return {
        ...state,
        childrenOrder: state.childrenDragOrder,
        listData,
        draggedIndex: null
      }
    })
    if (dragEnd) dragEnd(listData.map(el => el.item))
  }

  useEffect(() => {
    if (listItem.current) {
      const length = axis === 'x' ? listItem.current.getBoundingClientRect().width : listItem.current.getBoundingClientRect().height
      setState(state => ({ ...state, length }))
    }
  }, [axis])

  return (
    <div className="draggable-list">
      {state.childrenOrder.map((child, i) => {
        const isDragging = state.draggedIndex === i;
        const draggedPosition = state.childrenOrder.findIndex(item => item.key === child.key) * state.length
        const nonDraggedPosition = state.childrenDragOrder.findIndex(item => item.key === child.key) * state.length

        const styles = { position: 'absolute' }
        if (!isDragging) styles.transition = '.5s'
        if (axis === 'y') styles.top = isDragging ? draggedPosition : nonDraggedPosition
        if (axis === 'x') styles.left = isDragging ? draggedPosition : nonDraggedPosition

        return (
          <DraggableListItem
            key={child.key}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            child={child}
            axis={axis}
          >
            <div className="draggable-list__item" style={styles} ref={listItem}>
              {child}
            </div>
          </DraggableListItem>
        )
      })}
    </div>
  );
}