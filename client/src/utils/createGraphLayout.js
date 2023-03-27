import Elk from "elkjs";

const elk = new Elk({
  defaultLayoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.spacing.nodeNode': '150',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.edgeRouting': 'SPLINES',
    'elk.layered.nodePlacement.strategy': 'SIMPLE',
    // 'elk.edgeRouting.splines.mode': 'CONSERVATIVE',
    // 'elk.crossingMinimization.strategy': 'LAYER_SWEEP',
    // 'elk.layered.layering.strategy': 'NETWORK_SIMPLEX'
  }
})

const createGraphLayout = async (flowNodes, flowEdges) => {
    const elkNodes = [];
    const elkEdges = [];

    // Create an Elk node and edge for every React Flow node and edge
    flowNodes.forEach((node) => {
        elkNodes.push({
            id: node.id,
            width: node.width,
            height: node.height
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
                x: elkNode.x - elkNode.width / 2,
                y: elkNode.y - elkNode.height / 2,
            };
        }
        return flowNode;
    });
};

export default createGraphLayout;