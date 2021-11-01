import PropTypes from 'prop-types';
import React, { Component } from 'react';

const MOUSE_MOVE_THRESHOLD = 50;
let lastMouseMoveTime = -1;

export default class DraggableListHoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dragOrigin: { x: 0, y: 0 },
      dragOrder: props.children,
      draggedIndex: null,
      isDragging: false,
      order: props.children,
      selectedIndex: null,
      selectedKey: null,
      translation: { x: 0, y: 0 },
      itemLength: null,
    };
    this.listData = props.children.reduce((acc, el, i) => ({ ...acc, [el.key]: props.listData[i] }), {});
    this.listContainer = React.createRef();
    this.listItem = React.createRef();
  }

  static propTypes = {
    axis: PropTypes.oneOf(['x', 'y']),
    children: PropTypes.arrayOf(PropTypes.element),
    onDragEnd: PropTypes.func,
    listData: PropTypes.array.isRequired,
  }

  static defaultProps = {
    axis: 'y',
  };

  componentDidMount() {
    const item = this.listItem.current;
    const { marginLeft, marginRight, marginTop, marginBottom } = window.getComputedStyle(item.firstChild);
    const length = this.props.axis === 'x' ?
      item.getBoundingClientRect().width + parseInt(marginLeft, 10) + parseInt(marginRight, 10)
      : item.getBoundingClientRect().height + parseInt(marginTop, 10) + parseInt(marginBottom, 10);
    this.setState({ length });
  }

  componentDidUpdate() {
    if (this.state.isDragging) {
      window.addEventListener('mousemove', this.onMouseMove);
      window.addEventListener('mouseup', this.onMouseUp);
    } else {
      window.removeEventListener('mousemove', this.onMouseMove);
      window.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  onMouseMove = ({ clientX, clientY }) => {
    const now = +new Date();
    if (now - lastMouseMoveTime < MOUSE_MOVE_THRESHOLD) return;
    if (!this.state.isDragging) return;
    lastMouseMoveTime = now;
    const listBoundaries = this.listContainer.current.getBoundingClientRect();
    const x = clientX - listBoundaries.left;
    const y = clientY - listBoundaries.top;
    const translation = { x: x - this.state.dragOrigin.x, y: y - this.state.dragOrigin.y };
    if (this.props.axis === 'y') translation.x = 0;
    if (this.props.axis === 'x') translation.y = 0;

    const selectedItem = this.state.order[this.state.selectedIndex];
    const delta = this.props.axis === 'x' ? Math.floor(x / this.state.length) : Math.floor(y / this.state.length);
    const dragOrder = this.state.order.filter((item) => item !== selectedItem);

    if (delta < 0 || delta >= this.state.order.length) {
      return;
    }

    dragOrder.splice(delta, 0, selectedItem);

    if (this.state.draggedIndex !== delta) {
      this.setState(state => {
        const newTranslation = { x: this.props.axis === 'x' ? this.state.length / 2 : 0, y: this.props.axis === 'y' ? this.state.length / 2 : 0 };
        if (state.draggedIndex < delta) {
          newTranslation.x = -newTranslation.x;
          newTranslation.y = -newTranslation.y;
        }
        return {
          dragOrigin: { x: (delta * this.state.length) + (this.state.length / 2), y: (delta * this.state.length) + (this.state.length / 2) },
          draggedIndex: delta,
          dragOrder,
          translation: newTranslation,
        };
      });
    } else {
      this.setState({ translation });
    }
  };

  onMouseDown = (evt, index) => {
    evt.persist();
    this.setState(state => ({
      dragOrigin: { x: evt.clientX, y: evt.clientY },
      isDragging: true,
      selectedIndex: index,
      draggedIndex: index,
      selectedKey: state.order[index].key,
    }));
  };

  onMouseUp = () => {
    this.setState(state => ({
      isDragging: false,
      draggedIndex: null,
      order: state.dragOrder,
      translation: { x: 0, y: 0 },
    }));
    const orderedData = this.state.order.map(el => this.listData[el.key]);
    if (this.props.onDragEnd) this.props.onDragEnd(orderedData);
  };

  render() {
    const list = this.state.isDragging ? this.state.dragOrder : this.state.order;
    return (
      <div style={{ position: 'relative' }} ref={ this.listContainer }>
        {list.map((child, index) => {
          const isGrabbed = this.state.draggedIndex === index;
          const draggedIndex = this.state.dragOrder.filter(Boolean).findIndex(item => item.key === child.key);

          const itemStyle = {
            cursor: isGrabbed ? 'grabbing' : 'grab',
            position: 'absolute',
            transition: isGrabbed ? 0 : '.2s',
            transform: isGrabbed && `translate(${this.state.translation.x}px, ${this.state.translation.y}px)`,
            zIndex: isGrabbed ? 2 : 0,
          };
          if (this.state.length && this.props.axis === 'y') itemStyle.top = draggedIndex * this.state.length;
          if (this.state.length && this.props.axis === 'x') itemStyle.left = draggedIndex * this.state.length;

          return (
            <div
              key={ child.key }
              className="drag-wrapper"
              onMouseDown={ e => this.onMouseDown(e, index) }
              onDrag={ this.onDrag }
              ref={ this.listItem }
              style={ itemStyle }
            >
              {child}
            </div>
          );
        })}
      </div>
    );
  }
}
