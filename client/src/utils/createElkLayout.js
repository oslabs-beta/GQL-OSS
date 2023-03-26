import Elk, { ElkNode, ElkPrimitiveEdge, } from "elkjs";
// import { Node, Edge } from "react-flow-renderer";

/* From https://github.com/wbkd/react-flow/issues/5#issuecomment-954001434 */
/*
Get a sense of the parameters at:
https://rtsys.informatik.uni-kiel.de/elklive/examples.html?e=general%2Fspacing%2FnodesEdges
*/

// const DEFAULT_WIDTH = 330;
// const DEFAULT_HEIGHT = 75;
// const DEFAULT_WIDTH_FOR_ROOT = 170;

const elk = new Elk({
  defaultLayoutOptions: {
    'elk.algorithm': 'layered',
    'elk.direction': 'RIGHT',
    'elk.spacing.nodeNode': '150',
    // 'elk.layered.spacing.nodeNodeBetweenLayers': '500',
    'elk.edgeRouting': 'SPLINES',
    // 'elk.edgeRouting.splines.mode': 'CONSERVATIVE',
    // 'elk.crossingMinimization.strategy': 'LAYER_SWEEP',
    'elk.layered.nodePlacement.strategy': 'SIMPLE',
    // 'elk.layered.layering.strategy': 'NETWORK_SIMPLEX'
  }
})

const createElkLayout = async (flowNodes, flowEdges) => {
    const elkNodes = [];
    const elkEdges = [];

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

    const graph = await elk.layout({
        id: "graph",
        children: elkNodes,
        edges: elkEdges,
    });
    return flowNodes.map((flowNode) => {
        const elkNode = graph.children.find((eNode) => eNode.id === flowNode.id);
        if (elkNode.x && elkNode.y && elkNode.width && elkNode.height) {
            flowNode.position = {
                x: elkNode.x - elkNode.width / 2,
                y: elkNode.y - elkNode.height / 2,
            };
        }
        return flowNode;
    });
};

export default createElkLayout;