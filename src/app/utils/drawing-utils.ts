interface linePosition {
  left: number
  top: number
}

export function line(startPosition: linePosition, endPosition: linePosition) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')

  line.setAttribute('x1', startPosition.left.toString())
  line.setAttribute('y1', startPosition.top.toString())
  line.setAttribute('x2', endPosition.left.toString())
  line.setAttribute('y2', endPosition.top.toString())

  line.setAttribute('stroke-width', '1')
  line.setAttribute('stroke', '#cccccc')
  line.style.pointerEvents = 'auto'

  line.addEventListener('mouseover', () => {
    line.style.cursor = 'pointer'
  })
  line.addEventListener('mouseout', () => {
    line.style.cursor = 'auto'
  })

  return line
}
