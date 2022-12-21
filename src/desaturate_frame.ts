export function desaturateContainer() {
  if (figma.currentPage.selection.length > 0) {
    let containers: Array<FrameNode | GroupNode> = []
    for (let frame of figma.currentPage.selection) {
      if (frame.type === "FRAME" || frame.type === "GROUP") containers.push(frame)
    }
    if (containers.length > 0) {
      for (let container of containers) {
        if (container.type === 'GROUP') {
          _desaturateGroup(container)
        } 
        else if (container.type === 'FRAME' && container.layoutMode !== 'NONE') {
          _desaturateAutoLayout(container)
        } else {
          _desaturateFrame(container)  
        }
      }
      figma.notify('🎉')
    }
    else {
      figma.notify("🚫 Select at least one frame or group to desaturate.")
    }
  }
  else {
    figma.notify("🚫 Select at least one frame or group to desaturate.")
  }
  figma.closePlugin()
}

function _desaturateGroup(node: GroupNode) {
  let layer = createDesaturateLayer()
  layer.constraints = {
    horizontal: 'STRETCH',
    vertical: 'STRETCH'
  }
  layer.x = node.x
  layer.y = node.y
  layer.resize(node.width, node.height)
  node.appendChild(layer)
}

function _desaturateFrame(node: FrameNode) {
  let layer = createDesaturateLayer()
  node.appendChild(layer)
  layer.constraints = {
    horizontal: 'STRETCH',
    vertical: 'STRETCH'
  }
  layer.x = 0
  layer.y = 0
  layer.resize(node.width, node.height)
}

function _desaturateAutoLayout(node: FrameNode) {
  let layer = createDesaturateLayer()
  if (node.itemReverseZIndex) { 
    node.insertChild(0, layer) 
  }
  else {
    node.appendChild(layer) 
  }
  layer.layoutPositioning = 'ABSOLUTE'
  layer.constraints = {
    horizontal: 'STRETCH',
    vertical: 'STRETCH'
  }
  layer.x = 0
  layer.y = 0
  layer.resize(node.width, node.height)
}

function createDesaturateLayer(): RectangleNode {
  let layer: RectangleNode = figma.createRectangle()
  let fill: Paint = {
    type: "SOLID",
    color: {r: 0, g: 0, b: 0},
    blendMode: "SATURATION"
  }
  layer.fills = [fill]
  layer.name = "Desaturate Layer"
  layer.locked = true
  return layer
}