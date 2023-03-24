import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow,
{ Background,
  Controls,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  SelectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import TypeNode from './TypeNode';

// Declare custom node type
// Outside of component to prevent re-declaration upon every render
const nodeTypes = {
  typeNode: TypeNode,
};

const Visualizer = ({ vSchema }) => {
  // State management for a controlled react-flow
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  // Memoized (cached) event listeners to prevent unnecessary re-renders
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  // If a schema is loaded, map each Object Type to a Type Node
  useEffect(() => {
    if (!vSchema) return;
    const newNodes = vSchema.objectTypes.map((type, i) => ({
      id: type.name,
      position: { x: i * 300, y: 0 }, // TODO: refactor using a graph/hierarchy library
      data: {
        typeName: type.name,
        fields: type.fields,
        updateEdge: (newEdge) => {
          setEdges((prev) => [...prev, newEdge]);
        },
      },
      type: `typeNode`,
    }));
    setNodes(newNodes);
    setEdges([]);
  }, [vSchema]);

  return (
    <div className='visualizer-container'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        nodeTypes={nodeTypes}
        fitView
        panOnScroll={true}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Visualizer;