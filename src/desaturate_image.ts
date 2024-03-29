// Desaturate is a simple plugin that desaturates image fills in Figma. 
// Select any Frame or Vector object with an image fill and run the plugin.

const IS_LOGGING_ENABLED = false;

const ALLOWED_NODE_TYPES = [
  "COMPONENT",
  "COMPONENT_SET",
  "ELLIPSE",
  "FRAME",
  "GROUP",
  "INSTANCE",
  "LINE",
  "POLYGON",
  "RECTANGLE",
  "SLICE",
  "STAR",
  "VECTOR"
]

var numDesaturatedNodes = 0;

export function desaturateImage() {
  // MAIN
  try {
    if (figma.currentPage.selection.length > 0) {
      for(const node of figma.currentPage.selection) desaturateNodeTree(node);
      notifyStatus(numDesaturatedNodes)
    } else {
      figma.notify("🚫 Select at least one layer with an image fill.")
    }
  } catch (error) {
    console.error(error)
  }
  figma.closePlugin()
}

function notifyStatus(numDesaturatedNodes: number) {
  if (numDesaturatedNodes > 0) {
    figma.notify('🎉')
  } else {
    figma.notify("🚫 Select at least one layer with an image fill.")
  }
}

function desaturateNodeTree(node: any) {
  if (isNodeAllowed(node) && isNodeSaturated(node)) {
    _desaturateNode(node); // desaturate current level
  } else {
    _log("Skipping node: " + node.type);
  }
  
  if ("children" in node) {
    for (const child of node.children) {
      desaturateNodeTree(child); // desaturate next level
    }
  }
}

function isNodeAllowed(node: SceneNode) {
  return ALLOWED_NODE_TYPES.includes(node.type);
}

function isNodeSaturated(node: SceneNode) {
  if ("fills" in node) {
    const fills = Array.isArray(node.fills) ? node.fills : [node.fills];
    for (const fill of fills) {
      if (fill.type === "IMAGE" && fill.filters.saturation > -1) {
        return true;
      }
    }
  }
  return false;
}

function isFillSaturated(fill: any) {
  return fill.type === "IMAGE" && fill.filters.saturation > -1;
}

function _desaturateNode(node: any) {
  _log("Desaturating node:");
  _log(node);
  const fills: any = Array.isArray(node.fills) ? _clone(node.fills) : [_clone(node.fills)];
  for (const fill of fills) {
    if (isFillSaturated(fill)) {
      _desaturateFill(fill);
      numDesaturatedNodes++;
    }
  }
  node.fills = fills;
}

function _desaturateFill(fill: any) {
  _log("Desaturating fill:");
  _log(fill);
  fill.filters.saturation = -1;
}

function _log(object: any) {
  if (IS_LOGGING_ENABLED) console.log(object);
}

function _clone(val: any): any {
  const type = typeof val
  if (val === null) {
    return null
  } else if (type === 'undefined' || type === 'number' ||
             type === 'string' || type === 'boolean') {
    return val
  } else if (type === 'object') {
    if (val instanceof Array) {
      return val.map(x => _clone(x))
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val)
    } else {
      let o = {}
      for (const key in val) {
        o[key] = _clone(val[key])
      }
      return o
    }
  }
  throw 'unknown'
}