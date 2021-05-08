// Desaturate is a simple plugin that desaturates image fills in Figma. 
// Select any Frame or Vector object with an image fill and run the plugin.

var numDesaturatedNodes = 0;

if (figma.currentPage.selection.length > 0) {
  for(const node of figma.currentPage.selection) {
    desaturateNodeTree(node);
  }
  notifyStatus(numDesaturatedNodes);
} else {
  figma.notify("Select something to desaturate");
}
figma.closePlugin();

function notifyStatus(numDesaturatedNodes) {
  if (numDesaturatedNodes > 0) {
    figma.notify("Desaturated " + numDesaturatedNodes + " image " + (numDesaturatedNodes > 1 ? "fills" : "fill"));
  } else {
    figma.notify("No image fills detected -  please check selection")
  }
}

function desaturateNodeTree(node) {
  _desaturateNode(node); // Desaturate current level
  if ("children" in node) {
    for (const child of node.children) {
      desaturateNodeTree(child); // Desaturate next level
    }
  }
}

function _desaturateNode(node) {
  if ("fills" in node) {
    const fills = _clone(node.fills);
    for (const fill of fills) {
      _desaturateFill(fill);
    }
    node.fills = fills;
  }
}

function _desaturateFill(fill) {
  if (fill.type === "IMAGE") {
    fill.filters.saturation = -1;
    numDesaturatedNodes++;
  } 
}

function _clone(val) {
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