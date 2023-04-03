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
  MarkerType,
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
  customColors,
  setCustomColors,
  ghostMode,
  setGhostMode,
  ghostNodeIDs,
  setGhostNodeIDs,
  ghostEdgeIDs,
  setGhostEdgeIDs,
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
              isGhost: false,
              activeFieldIDs: currentActiveFieldIDs.current,
              ghostNodeIDs: displayMode,
              visualizerOptions,
              customColors: customColors,
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
        const isGhost = ghostNodeIDs?.includes(node.id) ? true : false;
        let isHidden;
        if (
          displayMode !== "activeOnly" ||
          isActive ||
          (isGhost && ghostMode === "on")
        )
          isHidden = false;
        else isHidden = true;
        const newNode = {
          ...node,
          data: {
            ...node.data,
            active: isActive,
            isGhost: isGhost,
            // Always update active fields reference to avoid stale state
            activeFieldIDs: currentActiveFieldIDs.current,
          },
          hidden: isHidden,
        };
        return newNode;
      });
    });
    // Queue graph generation (async) to explicitly occur AFTER nodes are set
    setTimeout(() => {
      generateGraph();
    }, 0);
  }, [activeTypeIDs, displayMode, ghostNodeIDs, ghostMode]);

  /* Update Active Edges  */
  // Whenever the display mode or active edge ID's change, update the edges' properties to reflect the changes
  useEffect(() => {
    setEdges((prevEdges) => {
      return prevEdges.map((edge) => {
        const isActive = activeEdgeIDs?.has(edge.id) ? true : false;
        const isGhost = ghostEdgeIDs?.includes(edge.id) ? true : false;
        let isHidden;
        if (
          displayMode !== "activeOnly" ||
          isActive ||
          (isGhost && ghostMode === "on")
        )
          isHidden = false;
        else isHidden = true;

        const newEdge = {
          ...edge,
          markerEnd: {
            ...edge.markerEnd,
            // TODO: refactor colors (many different paths you can take here)
            // e.g. global variables, color pickers, color schemes, dynamic color mappings
            color: isActive
              ? customColors["edgeHighlight"]
              : customColors["edgeDefault"],
            width: isActive ? 20 : 28,
            height: isActive ? 20 : 28,
            strokeWidth: isActive ? 0.5 : 0.7,
          },
          style: {
            stroke: isActive
              ? customColors["edgeHighlight"]
              : customColors["edgeDefault"],
            strokeWidth: isActive ? "2" : "1.1",
          },
          zIndex: isActive ? -1 : -2,
          hidden: isHidden,
          // hidden: displayMode === "activeOnly" && !isActive,
          active: isActive,
          animated: isActive,
          isGhost: isGhost,
        };
        return newEdge;
      });
    });
  }, [activeEdgeIDs, displayMode, ghostNodeIDs, ghostMode]);

  /* Update Ghost Type Nodes and Edges */
  /*
  POTENTIAL PROBLEM: the preceding UseEffects(mapping through the nodes)
  must happen before the proceeding UseEffect(deriving a list of Ghost Type IDs by parsing through "active nodes").
  Then, the preceding UseEffects must happen a SECOND time to apply the changes made via "ghost node/edge ids".

  Is there a way to simplify this process?
  */
  useEffect(() => {
    const updatedGhostEdges = [];
    const updatedGhostNodes = [];

    for (const edge of edges) {
      if (activeTypeIDs?.has(edge.source)) {
        updatedGhostEdges.push(edge.id);
        updatedGhostNodes.push(edge.target);
      }
      setGhostNodeIDs(updatedGhostNodes);
      setGhostEdgeIDs(updatedGhostEdges);
    }
  }, [ghostMode, activeEdgeIDs, displayMode]);

  /* When Display Mode Changes, Fit Nodes to View */
  useEffect(() => {
    setTimeout(() => flowInstance.fitView(), 0);
  }, [displayMode, ghostMode]);

  /**************************************** Helper Functions ****************************************/

  /* Generate Elk Graph Layout From React Flow Nodes & Edges */
  const generateGraph = async (initial = false) => {
    // Get accurate picture of nodes and edges from internal React Flow state
    const { nodeInternals, edges } = store.getState();
    const currNodes = Array.from(nodeInternals.values());
    let graphedNodes, activeNodes, activeEdges;
    if (displayMode === "activeOnly" && ghostMode === "on") {
      activeNodes = currNodes.filter((node) => node.data.isGhost);
      activeEdgeIDs = edges.filter((edge) => edge.active || edge.isGhost);
    } else if (displayMode === "activeOnly") {
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

  /* Toggle Ghost Mode */
  function toggleGhostMode() {
    setGhostMode((prevGhostMode) => (prevGhostMode === "on" ? "off" : "on"));
  }

  // /* Toggle Minimap */
  function toggleMinimap() {
    const showMinimap = !visualizerOptions.showMinimap;
    const updatedVisualizerOptions = { ...visualizerOptions, showMinimap };
    setVisualizerOptions(updatedVisualizerOptions);
  }

  // /* Toggle Controls */
  function toggleControls() {
    const showControls = !visualizerOptions.showControls;
    const updatedVisualizerOptions = { ...visualizerOptions, showControls };
    setVisualizerOptions(updatedVisualizerOptions);
  }

  const nodeColor = (node) => {
    // if (node.data.active) return "rgb(129 120 200 / 45%)";
    if (node.data.active) return "rgb(108 102 159 / 45%)";
    return "rgb(60 57 86 / 57%)";
    // return "rgba(188, 183, 204, .5)";
  };

  function updateColors(colorCode, colorTarget) {
    const currentColors = customColors;
    currentColors[colorTarget] = colorCode;
    const newColors = { ...currentColors };
    setCustomColors(newColors);
    setNodes((nodes) =>
      nodes.map((node) => {
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            activeFieldIDs: currentActiveFieldIDs.current,
            customColors: customColors,
          },
        };
        return updatedNode;
      })
    );
    // for(const node of nodes) updateNodeInternals(node.id);
    setEdges((edges) =>
      edges.map((edge) => {
        const updatedEdge = {
          ...edge,
          markerEnd: {
            width: edge.active ? 20 : 28,
            height: edge.active ? 20 : 28,
            strokeWidth: edge.active ? 0.5 : 0.7,
            color: edge.active
              ? customColors["edgeHighlight"]
              : customColors["edgeDefault"],
          },
          style: {
            stroke: edge.active
              ? customColors["edgeHighlight"]
              : customColors["edgeDefault"],
            strokeWidth: edge.active ? "2" : "1.1",
          },
        };
        return updatedEdge;
      })
    );
  }

  /************************************************ Render ******************************************************/

  return (
    // React Flow instance needs a container that has explicit width and height
    <div className="visualizer-container">
      <ReactFlow
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        nodeTypes={nodeTypes}
        panOnScroll={false}
        minZoom={0.1}
        maxZoom={2}
        zoom={1}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={"dots"} size={1.5} gap={55} color={"#a28a8a"} />
        <OptionsPanel
          visualizerOptions={visualizerOptions}
          toggleTargetPosition={toggleTargetPosition}
          displayMode={displayMode}
          toggleDisplayMode={toggleDisplayMode}
          toggleMinimap={toggleMinimap}
          toggleControls={toggleControls}
          customColors={customColors}
          setCustomColors={updateColors}
          ghostMode={ghostMode}
          toggleGhostMode={toggleGhostMode}
        />
        <Background />
        {showControls && <Controls />}
        {showMinimap && <MiniMap nodeColor={nodeColor} pannable={true} />}
      </ReactFlow>
    </div>
  );
};

export default Visualizer;
