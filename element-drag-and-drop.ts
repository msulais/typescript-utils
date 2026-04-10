let _lastY = 0
let _isDraggingDown = false
let _ghostElement: HTMLElement | null = null
let _offsetX = 0
let _offsetY = 0
const _transparentImg = new Image()
_transparentImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Each child element must include:
 * * `sortableVerticalListItemOnDragStart()` in `'dragstart'` event
 * * `sortableVerticalListItemOnDrag()` in `'drag'` event
 * * `sortableVerticalListItemOnDragEnd()` in `'dragend'` event
 */
export function sortableVerticalListOnDragOver<T extends HTMLElement = HTMLElement>(
	ev: DragEvent & { currentTarget: T },
	items: (ref: T) => Element[],
	draggedItem: () => (Element | null | undefined)
): void {
	const self = ev.currentTarget
	const clientY = ev.clientY

	ev.preventDefault()
	if (clientY !== _lastY) {
		_isDraggingDown = clientY > _lastY
		_lastY = clientY
	}

	const draggingItem = draggedItem()
	if (!draggingItem) {
		return
	}

	const siblings = items(self).filter(ref => ref !== draggingItem)
	const hoveredItem = siblings.find(sibling => {
		const box = sibling.getBoundingClientRect()
		return clientY >= box.top && clientY <= box.bottom
	})

	if (!hoveredItem) {
		return
	}

	if (_isDraggingDown) {
		self.insertBefore(draggingItem, hoveredItem.nextElementSibling)
	}
	else {
		self.insertBefore(draggingItem, hoveredItem)
	}
}

/**
 * This and sibling element also include:
 * * `sortableVerticalListItemOnDrag()`
 * * `sortableVerticalListItemOnDragEnd()`
 *
 * Parent element include:
 * * `sortableVerticalListOnDragOver()`
 */
export function sortableVerticalListItemOnDragStart<T extends HTMLElement = HTMLElement>(
	ev: DragEvent & { currentTarget: T },

	/** Mark this element as selected item. Maybe set custom class or attribute */
	dragItemMarker: (ref: T) => unknown,

	/** If you want to styling ghost element (dragged element above list) */
	ghostElement?: (ref: T) => unknown
): void {
	const self = ev.currentTarget
	ev.dataTransfer?.setDragImage(_transparentImg, 0, 0)

	const rect = self.getBoundingClientRect()
	_offsetX = ev.clientX - rect.left
	_offsetY = ev.clientY - rect.top

	_ghostElement = self.cloneNode(true) as T
	const parentDialog = self.closest('dialog')
	if (parentDialog) {
		parentDialog.appendChild(_ghostElement)
	}
	else {
		document.body.appendChild(_ghostElement)
	}

	Object.assign(_ghostElement.style, {
		position: 'fixed',
		top: `${ev.clientY - _offsetY}px`,
		left: `${ev.clientX - _offsetX}px`,
		width: `${rect.width}px`,
		height: `${rect.height}px`,
		pointerEvents: 'none', // CRITICAL: Prevents clone from blocking dragover events!
		zIndex: '9999',
		opacity: '1',
		scale: '1.05',
		boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
		margin: '0',
		transition: 'none'
	})

	ghostElement?.(_ghostElement as T)
	setTimeout(() => dragItemMarker(self))
}

/**
 * Sibling element also include:
 * * `sortableVerticalListItemOnDragStart()`
 * * `sortableVerticalListItemOnDragEnd()`
 *
 * Parent element include:
 * * `sortableVerticalListOnDragOver()`
 */
export function sortableVerticalListItemOnDrag(ev: DragEvent): void {
	const y = ev.clientY
	if (_ghostElement && y !== 0) {
		_ghostElement.style.setProperty('top', `${y - _offsetY}px`)
	}
}

/**
 * Sibling element also include:
 * * `sortableVerticalListItemOnDragStart()`
 * * `sortableVerticalListItemOnDrag()`
 *
 * Parent element include:
 * * `sortableVerticalListOnDragOver()`
 */
export function sortableVerticalListItemOnDragEnd<T extends HTMLElement = HTMLElement>(
	ev: DragEvent & { currentTarget: T },

	/** Mark this element as unselected item. Maybe unset custom class or attribute */
	dragItemUnmarker: (ref: HTMLElement) => unknown
): void {
	dragItemUnmarker(ev.currentTarget)
	_ghostElement?.remove()
	_ghostElement = null
}