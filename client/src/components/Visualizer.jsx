import React, { useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  SelectionMode,
  useNodesInitialized,
  useStoreApi,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import TypeNode from "./TypeNode";
import createGraphLayout from "../utils/createGraphLayout";
import "../styles/Visualizer.css";

/* Custom Node */
// Declared outside of component to prevent re-declaration upon every render
const nodeTypes = {
  typeNode: TypeNode,
};

const Visualizer = ({ vSchema }) => {
  // State management for a controlled React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State relating to React Flow internals
  const store = useStoreApi();
  const nodesInitialized = useNodesInitialized();
  const flowInstance = useReactFlow();

  /* Create Initial Nodes & Edges */
  // If a schema is passed in, map each Object Type to a Type Node
  useEffect(() => {
    if (!vSchema) return;
    // graphed.current = false;
    const newNodes = vSchema.objectTypes.map((type) => ({
      id: type.name,
      // Initial positions are arbitary and will be overwritten by Elk positions.
      // React Flow nodes need to be initialized before processed by Elk.
      position: { x: 0, y: 0 },
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
  }, [vSchema]);

  /* Process the initial nodes & edges through Elk Graph */
  useEffect(() => {
    if (!nodesInitialized) return;
    const generateGraph = async () => {
      // Get accurate picture of nodes and edges from internal React Flow state
      const { nodeInternals, edges } = store.getState();
      const currNodes = Array.from(nodeInternals.values());
      // Generate a graph layout from the nodes and edges using Elk
      const graphedNodes = await createGraphLayout(currNodes, edges);
      // Reset React Flow nodes to reflect the graph layout
      setNodes(graphedNodes);
      // Queue fitView to occur AFTER the graphed nodes have asynchronously been set
      setTimeout(() => flowInstance.fitView(), 0);
    };
    generateGraph();
  }, [vSchema, nodesInitialized, store]);

  return (
    // React Flow instance needs a container that has explicit width and height
    <div className="visualizer-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        nodeTypes={nodeTypes}
        fitView={true}
        panOnScroll={true}
        zoom={1}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Visualizer;
