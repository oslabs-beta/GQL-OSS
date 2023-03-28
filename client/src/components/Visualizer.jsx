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

const Visualizer = ({ vSchema, activeTypeIDs, activeFieldIDs, activeEdgeIDs, displayMode}) => {
  // State management for a controlled React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // State relating to React Flow internals
  const store = useStoreApi();
  const nodesInitialized = useNodesInitialized();
  const flowInstance = useReactFlow();

  /* Generate an Elk graph layout from a set of React Flow nodes and edges */
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

  /* Create Initial Nodes & Edges */
  // If a schema is passed in, map each Object Type to a Type Node
  useEffect(() => {
    if (!vSchema) return;
    const newNodes = vSchema.objectTypes.map(type => ({
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
        active: false,
        activeFieldIDs,
        displayMode
      },
      type: `typeNode`,
    }));
    setNodes(newNodes);
  }, [vSchema]);


  // Process the initial nodes & edges through Elk Graph
  // whenever the schema is reset or the nodes are fully reinitialized
  useEffect(() => {
    if (!nodesInitialized) return;
    generateGraph();
  }, [vSchema, nodesInitialized]);

  // Whenever the active type ID's change, update the nodes' properties to reflect the changes
  useEffect(() => {
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        const isActive = activeTypeIDs?.has(node.id) ? true : false;
        const newNode = {
          ...node,
          data: {
            ...node.data,
            active: isActive,
            activeFieldIDs
          },
          hidden: displayMode === 'activeOnly' && !isActive
        }
        return newNode;
      })
    });
  }, [activeTypeIDs, displayMode]);

  // Whenever the active edge ID's change, update the edges' properties to reflect the changes
  useEffect(() => {
    setEdges(prevEdges => {
      return prevEdges.map(edge => {
        const isActive = activeEdgeIDs.has(edge.id);
        return {
          ...edge,
          markerEnd: {
            ...edge.markerEnd,
              color: isActive ? 'magenta' : 'cornflowerblue'
          },
          style: {stroke: isActive ? 'magenta' : 'cornflowerblue'},
          zIndex: isActive ? -1 : -2,
          hidden: displayMode === 'activeOnly' && !isActive
        }
      });
    });
  }, [activeEdgeIDs, displayMode]);

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
