import dagre from 'dagre';
// import { Node } from 'reactflow';

const createGraphLayout = (flowNodeStates) => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    // ranker: 'network-simplex',
//  ranker: 'tight-tree',
//  ranker: 'longest-path',
    rankdir: 'LR',
    ranksep: 50,
    // edgesep: 200,
  });


  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}));

  flowNodeStates.forEach((node) => {
    // console.log('node: ', node);
    // console.log('node id: ', node.id);
    // console.log('node width: ', node.width);
    // console.log('node height: ', node.height);
    g.setNode(node.id, {
      label: node.id,
      width: node.width,
      height: node.height,
    });
    // Setting dagre edges based on RF Custom Node (Type Node) edges
    // For every field that has a relationship, exists a corresponding edge
    node.data.fields &&
      node.data.fields.forEach((field) => {
        // console.log('here');
        if (field.relationship) g.setEdge(node.id, field.relationship);
      });
  });

  dagre.layout(g);

  return flowNodeStates.map((nodeState) => {
    const node = g.node(nodeState.id);
    return {
      ...nodeState,
      position: {
        // The position from dagre layout is the center of the node.
        // Calculating the position of the top left corner for rendering.
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
      },
    };
  });
};

export default createGraphLayout;