import React, { useEffect, useRef, useState } from "react";
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
import { defaultVisualizerOptions } from "../utils/defaultVisualizerOptions";

/* Custom Node */
// Declared outside of component to prevent re-declaration upon every render
const nodeTypes = {
  typeNode: TypeNode,
};

/* VISUALIZER COMPONENT */

const Visualizer = ({
  vSchema,
  activeTypeIDs,
  activeFieldIDs,
  activeEdgeIDs,
  displayMode,
  setDisplayMode,
}) => {
  /********************************************** State & Refs *************************************************/

  // State management for a controlled React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // React Flow hooks for managing flow instance internals
  const flowInstance = useReactFlow();
  const store = useStoreApi();
  const nodesInitialized = useNodesInitialized();
  const updateNodeInternals = useUpdateNodeInternals();

  // Ref for maintaining accurate picture of current active field ID's in listeners & callbacks
  const currentActiveFieldIDs = useRef(activeFieldIDs);

  // State management for VZ options
  const [visualizerOptions, setVisualizerOptions] = useState(
    defaultVisualizerOptions
  );
  const { showControls, showMinimap } = visualizerOptions;

  /********************************************** useEFfect's *************************************************/

  /* Update Active Field ID Reference to Accurate State Upon Change */
  useEffect(() => {
    currentActiveFieldIDs.current = activeFieldIDs;
  }, [activeFieldIDs]);

  /* Create Initial Nodes & Edges */
  // If a valid vSchema is passed in, map each Object Type to a Type Node
  useEffect(() => {
    if (!vSchema) return;
    setEdges([]);
    setNodes([]);
    // Queue new node setting to explicitly occur AFTER edges & nodes reset
    setTimeout(
      () =>
        setNodes(
          vSchema.objectTypes.map((type) => ({
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
              activeFieldIDs: currentActiveFieldIDs.current,
              displayMode,
              visualizerOptions,
            },
            type: `typeNode`,
          }))
        ),
      0
    );
  }, [vSchema]);

  /* Process Initial Nodes & Edges Through Elk */
  // Whenever the initialization state of the nodes changes from false to true, regraph them
  useEffect(() => {
    if (!nodesInitialized) return;
    generateGraph(true);
  }, [nodesInitialized]);

  /* Update Active Type Nodes */
  // Whenever the display mode or active type ID's change, update the nodes' properties to reflect the changes
  useEffect(() => {
    if (!vSchema) return;
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        const isActive = activeTypeIDs?.has(node.id) ? true : false;
        const newNode = {
          ...node,
          data: {
            ...node.data,
            active: isActive,
            // Always update active fields reference to avoid stale state
            activeFieldIDs: currentActiveFieldIDs.current,
          },
          hidden: displayMode === "activeOnly" && !isActive,
        };
        return newNode;
      });
    });
    // Queue graph generation (async) to explicitly occur AFTER nodes are set
    setTimeout(() => {
      generateGraph();
    }, 0);
  }, [activeTypeIDs, displayMode]);

  /* Update Active Edges  */
  // Whenever the display mode or active edge ID's change, update the edges' properties to reflect the changes
  useEffect(() => {
    setEdges((prevEdges) => {
      return prevEdges.map((edge) => {
        const isActive = activeEdgeIDs?.has(edge.id) ? true : false;
        return {
          ...edge,
          markerEnd: {
            ...edge.markerEnd,
            // TODO: refactor colors (many different paths you can take here)
            // e.g. global variables, color pickers, color schemes, dynamic color mappings
            color: isActive ? "magenta" : "cornflowerblue",
          },
          style: {
            stroke: isActive ? "magenta" : "cornflowerblue",
            strokeWidth: isActive ? "1.5" : "1.1",
          },
          zIndex: isActive ? -1 : -2,
          hidden: displayMode === "activeOnly" && !isActive,
          active: isActive,
          animated: isActive,
        };
      });
    });
  }, [activeEdgeIDs, displayMode]);

  /* When Display Mode Changes, Fit Nodes to View */
  useEffect(() => {
    setTimeout(() => flowInstance.fitView(), 0);
  }, [displayMode]);

  /**************************************** Helper Functions ****************************************/

  /* Generate Elk Graph Layout From React Flow Nodes & Edges */
  const generateGraph = async (initial = false) => {
    // Get accurate picture of nodes and edges from internal React Flow state
    const { nodeInternals, edges } = store.getState();
    const currNodes = Array.from(nodeInternals.values());
    let graphedNodes, activeNodes, activeEdges;
    if (displayMode === "activeOnly") {
      activeNodes = currNodes.filter((node) => node.data.active);
      activeEdges = edges.filter((edge) => edge.active);
    }
    // Generate graph layout from React Flow nodes & edges by processing through Elk
    if (initial || displayMode === "all")
      graphedNodes = await createGraphLayout(currNodes, edges);
    else if (displayMode === "activeOnly")
      graphedNodes = await createGraphLayout(activeNodes, activeEdges);

    // Remap React Flow nodes to reflect the graph layout
    if (initial) setNodes(graphedNodes); // Just map to initial state
    // Otherwise, do not overwrite existing state, but alter it accordingly
    else {
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          // Account for dynamic shifting between display modes and permutations of active status
          const matchingGraphedNode = graphedNodes.find(
            (gNode) => gNode.id === node.id
          );
          if (matchingGraphedNode) return matchingGraphedNode;
          return node;
        });
      });
    }
    // Queue fitView to explicitly occur AFTER the graphed nodes have asynchronously been set
    if (displayMode === "activeOnly" || initial)
      setTimeout(() => flowInstance.fitView(), 0);
    // You can configure this to fitView after every change when displayMode === 'all' as well,
    // however that UX feels slightly worse
  };

  /* Toggle Target Position */
  function toggleTargetPosition() {
    const targetPosition =
      visualizerOptions.targetPosition === "left" ? "top" : "left";
    const updatedVisualizerOptions = { ...visualizerOptions, targetPosition };
    setVisualizerOptions(updatedVisualizerOptions);
    setNodes((nodes) =>
      nodes.map((node) => {
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            visualizerOptions: updatedVisualizerOptions,
          },
        };
        updateNodeInternals(updatedNode.id);
        return updatedNode;
      })
    );
  }

  /* Toggle Display Mode */
  function toggleDisplayMode() {
    setDisplayMode((prevDisplayMode) =>
      prevDisplayMode === "activeOnly" ? "all" : "activeOnly"
    );
  }

  // /* Toggle Minimap */
  function toggleMinimap() {
    const showMinimap = !visualizerOptions.showMinimap;
    const updatedVisualizerOptions = { ...visualizerOptions, showMinimap };
    return setVisualizerOptions(updatedVisualizerOptions);
  }

  // /* Toggle Controls */
  function toggleControls() {
    const showControls = !visualizerOptions.showControls;
    const updatedVisualizerOptions = { ...visualizerOptions, showControls };
    return setVisualizerOptions(updatedVisualizerOptions);
  }

  /************************************************ Render ******************************************************/

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
          displayMode={displayMode}
          toggleDisplayMode={toggleDisplayMode}
          toggleMinimap={toggleMinimap}
          toggleControls={toggleControls}
        />
        <Background />
        {showControls && <Controls />}
        {showMinimap && <MiniMap />}
      </ReactFlow>
    </div>
  );
};

export default Visualizer;
