import Elk from "elkjs";

const elk = new Elk({
  defaultLayoutOptions: {
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT",
    "elk.spacing.nodeNode": "130",
    "elk.layered.spacing.nodeNodeBetweenLayers": "100",
    "elk.layered.noOverlap": true,
    // 'elk.padding': '[top=50, bottom=50, left=50, right=50]',
    "elk.edgeRouting": "SPLINES",
    // "elk.layered.edgeRouting.splines.mode": "SLOPPY",
    "elk.layered.nodePlacement.strategy": "SIMPLE",
    "elk.topdownLayout": true,
    // SIMPLE
    // INTERACTIVE (@AdvancedPropertyValue)
    // LINEAR_SEGMENTS
    // BRANDES_KOEPF
    // NETWORK_SIMPLEX
    "elk.layered.layering.strategy": "STRETCH_WIDTH",

    // STRETCH_WIDTH (@ExperimentalPropertyValue)
    // MIN_WIDTH (@ExperimentalPropertyValue)

    // NETWORK_SIMPLEX
    // LONGEST_PATH
    // LONGEST_PATH_SOURCE
    // COFFMAN_GRAHAM (@AdvancedPropertyValue)
    // INTERACTIVE (@AdvancedPropertyValue)

    // BF_MODEL_ORDER
    // DF_MODEL_ORDER
    // "elk.layered.highDegreeNodes.treatment": true,
    // // "elk.layered.highDegreeNodes.treeHeight": 1,
    // "elk.layered.highDegreeNodes.threshold": 18,
    // "elk.layered.layering.strategy": "COFFMAN_GRAHAM",
    // "elk.layered.layering.coffmanGraham.layerBound": 3,
    // "elk.hierarchyHandling": "INCLUDE_CHILDREN",
    // "elk.layered.crossingMinimization.hierarchicalSweepiness": 1,

    // "elk.layered.layering.coffmanGraham.layerBound": 5,
    // "elk.layered.wrapping.cutting.strategy": "MANUAL",
    // 'elk.edgeRouting.splines.mode': 'CONSERVATIVE',
    // "elk.crossingMinimization.strategy": "INTERACTIVE",
    // "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
  },
});

const createGraphLayout = async (flowNodes, flowEdges) => {
  const elkNodes = [];
  const elkEdges = [];

  // Create an Elk node and edge for every React Flow node and edge
  flowNodes.forEach((node) => {
    elkNodes.push({
      id: node.id,
      width: node.width,
      height: node.height,
    });
  });
  flowEdges.forEach((edge) => {
    elkEdges.push({
      id: edge.id,
      target: edge.target,
      source: edge.source,
    });
  });

  // Create Elk graph based on nodes, edges, and configuration defined above
  const graph = await elk.layout({
    id: "root",
    children: elkNodes,
    edges: elkEdges,
  });
  // Map the positions of each Elk node back onto the corresponding React Flow node
  return flowNodes.map((flowNode) => {
    const elkNode = graph.children.find((eNode) => eNode.id === flowNode.id);
    if (elkNode.x && elkNode.y && elkNode.width && elkNode.height) {
      flowNode.position = {
        // For nodes:
        // Elk coordinates are centered
        // React Flow coordinates start at upper left
        x: elkNode.x,
        // - elkNode.width / 2,
        y: elkNode.y,
      };
    }
    return flowNode;
  });
};

export default createGraphLayout;
