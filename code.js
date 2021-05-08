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
];
var numDesaturatedNodes = 0;
try {
    if (figma.currentPage.selection.length > 0) {
        _log(figma.currentPage.selection);
        for (const node of figma.currentPage.selection) {
            desaturateNodeTree(node);
        }
        notifyStatus(numDesaturatedNodes);
    }
    else {
        figma.notify("Select something to desaturate");
    }
}
catch (error) {
    _log(error);
}
figma.closePlugin();
function notifyStatus(numDesaturatedNodes) {
    if (numDesaturatedNodes > 0) {
        figma.notify("Desaturated " + numDesaturatedNodes + " image " + (numDesaturatedNodes > 1 ? "fills" : "fill"));
    }
    else {
        figma.notify("No image fills detected -  please check selection");
    }
}
function desaturateNodeTree(node) {
    _log("Processing node tree: ");
    _log(node);
    _desaturateNode(node); // Desaturate current level
    if ("children" in node) {
        for (const child of node.children) {
            desaturateNodeTree(child); // Desaturate next level
        }
    }
}
function _desaturateNode(node) {
    if (isNodeAllowed(node)) {
        _log("Desaturating node: ");
        _log(node);
        if ("fills" in node) {
            const fills = _clone(node.fills);
            if (Array.isArray(fills)) {
                for (const fill of fills) {
                    _desaturateFill(fill);
                }
            }
            else {
                _desaturateFill(fills);
            }
            node.fills = fills;
        }
    }
    else {
        _log("Skipping node because it is disallowed: " + node.type);
    }
}
function _desaturateFill(fill) {
    _log("Desaturating fill: ");
    _log(fill);
    if ("type" in fill && fill.type === "IMAGE") {
        fill.filters.saturation = -1;
        numDesaturatedNodes++;
    }
}
function isNodeAllowed(node) {
    return ALLOWED_NODE_TYPES.includes(node.type);
}
function _log(object) {
    if (IS_LOGGING_ENABLED)
        console.log(object);
}
function _logError(error) {
    console.error(error);
}
function _clone(val) {
    const type = typeof val;
    if (val === null) {
        return null;
    }
    else if (type === 'undefined' || type === 'number' ||
        type === 'string' || type === 'boolean') {
        return val;
    }
    else if (type === 'object') {
        if (val instanceof Array) {
            return val.map(x => _clone(x));
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            let o = {};
            for (const key in val) {
                o[key] = _clone(val[key]);
            }
            return o;
        }
    }
    throw 'unknown';
}
