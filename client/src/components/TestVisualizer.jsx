import React, { useState, useCallback } from "react";
import ReactFlow, {applyEdgeChanges, applyNodeChanges} from "reactflow";
import { Grid } from "pathfinding";

function calculatePath(startNode, endNode, nodes) {
  const grid = new Grid(nodes.length, nodes[0].length);
  nodes.forEach((row, rowIndex) => {
    row.forEach((node, colIndex) => {
      if (node.type === "empty") {
        grid.setWalkableAt(colIndex, rowIndex, true);
      } else {
        grid.setWalkableAt(colIndex, rowIndex, false);
      }
    });
  });
  const finder = new Pathfinding.AStarFinder();
  const path = finder.findPath(
    startNode.position.x,
    startNode.position.y,
    endNode.position.x,
    endNode.position.y,
    grid
  );
  return path.map(([x, y]) => ({ x, y }));
}

function getEdgePath(edge) {
  const { source, target } = edge;
  const path = calculatePath(source, target, nodes);
  return (
    <path
      d={`M${path[0].x},${path[0].y}${path
        .slice(1)
        .map((p) => `L${p.x},${p.y}`)
        .join("")}`}
      stroke="#ddd"
      strokeWidth={2}
      fill="none"
    />
  );
}

const initialNodes = [
  {
    id: "1",
    type: "input",
    position: { x: 0, y: 50 },
    data: { label: "Input Node" },
  },
  {
    id: "2",
    type: "output",
    position: { x: 200, y: 50 },
    data: { label: "Output Node" },
  }
];
const initialEdges = [

  { id: "e1-2", source: "1", target: "2", animated: true, stroke: getEdgePath},
]


export default function TestVisualizer() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  return (
    <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        selectionOnDrag={true}
      />
  );
}
