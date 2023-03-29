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
  setDisplayMode,
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
    console.log('HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.log('vSchema: ', vSchema);
    if (!vSchema) return;
    setEdges([]);
    setTimeout(() => setNodes(vSchema.objectTypes.map((type) => ({
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
    }))), 0);

    // allNodes.current = newNodes;
  }, [vSchema]);


  // Process the initial nodes & edges through Elk Graph
  // whenever the schema is reset or the nodes are fully reinitialized
  useEffect(() => {

    const stateEdges = store.getState().edges;
    console.log('IN USE EFFECT');
    console.log('vSchema: ', vSchema);
    console.log('nodesInitialized: ', nodesInitialized);
    console.log('edges: ', edges);
    console.log('stateEdges: ', stateEdges);
    console.log('nodes: ', nodes);
    console.log('stateNodes: ', Array.from(store.getState().nodeInternals.values()));
    if (!nodesInitialized) return;
    console.log('IN USE EFFECT, NOT TIMED OUT - GOING TO GENERATE GRAPH');
    generateGraph(true);
  }, [nodesInitialized]);

  // Whenever the active type ID's change, update the nodes' properties to reflect the changes
  useEffect(() => {
    if (!vSchema) return;
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
    setTimeout(() => {
      console.log('USEEFFECT SETTIMEOUT NOW GENERATING GRAPH');
      generateGraph()
    }, 0)
  }, [activeTypeIDs, displayMode]);

  // Whenever the active edge ID's change, update the edges' properties to reflect the changes
  useEffect(() => {
    // if (!activeEdgeIDs) return;
    setEdges(prevEdges => {
      // console.log('prevEdges: ', prevEdges);
      // console.log('activeEdgeIDs: ', activeEdgeIDs);
      return prevEdges.map(edge => {
        const isActive = activeEdgeIDs?.has(edge.id) ? true : false;
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

  // useEffect(() => {
  //   setTimeout(() => flowInstance.fitView(), 0);
  // }, [displayMode]);

  /**************************************** Helper Functions ****************************************/
  /* Generate an Elk graph layout from a set of React Flow nodes and edges */
  const generateGraph = async (initial = false) => {
    // Get accurate picture of nodes and edges from internal React Flow state
    console.log(' IN GEN GRAPH nodes init: ', nodesInitialized);
    const { nodeInternals, edges } = store.getState();
    const currNodes = Array.from(nodeInternals.values());
    console.log(' IN GEN GRAPH  currNodes: ', currNodes);
    console.log('IN GEN GRAPH  nodes: ', nodes);
    console.log('IN GEN GRAPH  edges: ', edges);
    const activeNodes = currNodes.filter(node =>  node.data.active);
    const activeEdges = edges.filter(edge => edge.active);
    console.log('IN GEN GRAPH  active nodes: ', activeNodes);
    console.log('IN GEN GRAPH  active edges: ', activeEdges);
    // Generate a graph layout from the nodes and edges using Elk
    let graphedNodes;
    if (initial || displayMode === 'all') graphedNodes = await createGraphLayout(currNodes, edges);
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

  function toggleDisplayMode() {
    setDisplayMode(prevDisplayMode => prevDisplayMode === 'activeOnly' ? 'all' : 'activeOnly');
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
          displayMode={displayMode}
          toggleDisplayMode={toggleDisplayMode}
        />
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Visualizer;
