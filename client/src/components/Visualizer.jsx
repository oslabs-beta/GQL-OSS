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
  useUpdateNodeInternals,
} from "reactflow";
import { OptionsPanel } from "./OptionsPanel";
import TypeNode from "./TypeNode";
import createGraphLayout from "../utils/createGraphLayout";
import "reactflow/dist/style.css";
import "../styles/Visualizer.css";

/* Custom Node */
// Declared outside of component to prevent re-declaration upon every render
const nodeTypes = {
  typeNode: TypeNode,
};

const Visualizer = ({
  vSchema,
  activeTypeIDs,
  activeFieldIDs,
  activeEdgeIDs,
  displayMode,
  visualizerOptions,
  setVisualizerOptions,
}) => {
  // State management for a controlled React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const updateNodeInternals = useUpdateNodeInternals();

  const allNodes = useRef(null);

  // State relating to React Flow internals
  const store = useStoreApi();
  const nodesInitialized = useNodesInitialized();
  const flowInstance = useReactFlow();

  /**************************************** useEffects ****************************************/

  /* Create Initial Nodes & Edges */
  // If a schema is passed in, map each Object Type to a Type Node
  useEffect(() => {
    if (!vSchema) return;
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
        active: false,
        activeFieldIDs,
        displayMode,
        visualizerOptions,
      },
      type: `typeNode`,
    }));
    setNodes(newNodes);
    // allNodes.current = newNodes;
  }, [vSchema]);


  // Process the initial nodes & edges through Elk Graph
  // whenever the schema is reset or the nodes are fully reinitialized
  useEffect(() => {
    if (!nodesInitialized) return;
    generateGraph(true);
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
      });
    });
    if (displayMode === 'activeOnly') setTimeout(() => generateGraph(), 0)
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
          hidden: displayMode === 'activeOnly' && !isActive,
          active: isActive
        }
      });
    });
    // if (displayMode === 'activeOnly') setTimeout(() => generateGraph(), 0)
  }, [activeEdgeIDs, displayMode]);

  /**************************************** Helper Functions ****************************************/
  /* Generate an Elk graph layout from a set of React Flow nodes and edges */
  const generateGraph = async (initial = false) => {
    // Get accurate picture of nodes and edges from internal React Flow state
    console.log('nodes init: ', nodesInitialized);
    const { nodeInternals, edges } = store.getState();
    const currNodes = Array.from(nodeInternals.values());
    console.log('currNodes: ', currNodes);
    console.log('nodes: ', nodes);
    console.log('edges: ', edges);
    const activeNodes = currNodes.filter(node =>  node.data.active);
    const activeEdges = edges.filter(edge => edge.active);
    console.log('active nodes: ', activeNodes);
    console.log('active edges: ', activeEdges);
    // Generate a graph layout from the nodes and edges using Elk
    let graphedNodes;
    if (initial) graphedNodes = await createGraphLayout(currNodes, edges);
    else if (displayMode === 'activeOnly') graphedNodes = await createGraphLayout(activeNodes, activeEdges);

    // Reset React Flow nodes to reflect the graph layout
    if (initial) setNodes(graphedNodes)
    else {
      setNodes(prevNodes => {
        return prevNodes.map(node => {
          const matchingGraphedNode = graphedNodes.find(gNode => gNode.id === node.id)
          if (matchingGraphedNode) return matchingGraphedNode;
          return node;
        })
      }); // THE ISSUE IS HERE
    }
    // Queue fitView to occur AFTER the graphed nodes have asynchronously been set
    setTimeout(() => flowInstance.fitView(), 0);
  };

  // toggleTargetPosition
  function toggleTargetPosition() {
    const targetPosition =
      visualizerOptions.targetPosition === "left" ? "top" : "left";
    const newTargetPosition = { targetPosition };
    setVisualizerOptions(newTargetPosition);
    setNodes((nodes) =>
      nodes.map((node) => {
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            visualizerOptions: newTargetPosition,
          },
        };
        updateNodeInternals(updatedNode.id);
        return updatedNode;
      })
    );
  }

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
        panOnScroll={true}
        zoom={1}
        minZoom={0.1}
        maxZoom={2}
      >
        <OptionsPanel
          visualizerOptions={visualizerOptions}
          toggleTargetPosition={toggleTargetPosition}
        />
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

  // // toggleTargetPosition
  // function toggleTargetPosition(targetPosition) {
  //   const newTargetPosition = { targetPosition };
  //   setVisualizerOptions(newTargetPosition);
  //   setNodes((nodes) =>
  //     nodes.map((node) => {
  //       const updatedNode = {
  //         ...node,
  //         data: {
  //           ...node.data,
  //           visualizerOptions: newTargetPosition,
  //         },
  //       };
  //       updateNodeInternals(updatedNode.id);
  //       return updatedNode;
  //     })
  //   );
  // }

export default Visualizer;
