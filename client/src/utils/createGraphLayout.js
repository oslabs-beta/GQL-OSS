import Elk from "elkjs";

/* Configure the Elk Layout options (The shape and nature of the graph) */
/* Check ELK docs for all details */
/* In summary, using layered algo and forcing to have wide aspect ratio */
const elk = new Elk({
  defaultLayoutOptions: {
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT",
    "elk.spacing.nodeNode": "130",
    "elk.layered.spacing.nodeNodeBetweenLayers": "100",
    "elk.layered.noOverlap": true,
    "elk.edgeRouting": "SPLINES",
    "elk.layered.nodePlacement.strategy": "SIMPLE",
    "elk.topdownLayout": true,
    "elk.layered.layering.strategy": "STRETCH_WIDTH",
  },
});

/* Take React Flow nodes and edges and transform them into a directed graph layout with ELK */
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

  /* NOTE: not utilizing 'ports' even though we have React Flow handles */
  /* Ports would allow for pathfinding and cross-minimization via custom React Flow edges */

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
        x: elkNode.x,
        y: elkNode.y,
      };
    }
    return flowNode;
  });
};

export default createGraphLayout;
