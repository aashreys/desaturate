export function desaturateFrame() {
  if (figma.currentPage.selection.length > 0) {
    let frames: Array<FrameNode | GroupNode> = []
    for (let frame of figma.currentPage.selection) {
      if (frame.type === "FRAME" || frame.type === "GROUP") frames.push(frame)
    }
    if (frames.length > 0) {
      for (let frame of frames) _desaturateFrameOrGroup(frame)
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

function _desaturateFrameOrGroup(node: FrameNode | GroupNode) {
  let desaturateLayer = createDesaturateLayer(node.width, node.height)
  node.appendChild(desaturateLayer)
  desaturateLayer.x = 0
  desaturateLayer.y = 0
  desaturateLayer.name = "Desaturate Layer"
  desaturateLayer.locked = true
}

function createDesaturateLayer(width: number, height: number): RectangleNode {
  let layer: RectangleNode = figma.createRectangle()
  layer.resize(width, height)
  let fill: Paint = {
    type: "SOLID",
    color: {r: 0, g: 0, b: 0},
    blendMode: "SATURATION"
  }
  layer.fills = [fill]
  return layer
}