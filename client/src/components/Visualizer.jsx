import React, { useEffect, useState, useCallback, useRef } from 'react';
import ReactFlow,
{ Background,
  Controls,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  SelectionMode,
  ReactFlowProvider,
  useNodesInitialized,
  useStoreApi
} from 'reactflow';
import 'reactflow/dist/style.css';
import TypeNode from './TypeNode';
import {
  getSmartEdge,
	svgDrawSmoothLinePath,
	svgDrawStraightLinePath,
	pathfindingAStarDiagonal,
	pathfindingAStarNoDiagonal,
	pathfindingJumpPointNoDiagonal,
  SmartBezierEdge,
  SmartStraightEdge,
  SmartStepEdge,
} from '@tisoap/react-flow-smart-edge';

import SmartEdge from './SmartEdge';
import createGraphLayout from '../utils/createGraphLayout';
// Declare custom node type
// Outside of component to prevent re-declaration upon every render
const nodeTypes = {
  typeNode: TypeNode,
};
// Same as importing "SmartBezierEdge" directly
// const bezierResult = getSmartEdge({
//   // ...
// 	options: {
//     drawEdge: svgDrawStraightLinePath,
// 		generatePath: pathfindingJumpPointNoDiagonal,
// 	}
// })

const edgeTypes = {
  // smart: SmartBezierEdge
  // smart: bezierResult
  smart: SmartEdge
  // smart: SmartStepEdge
  // smart: SmartStraightEdge
}

const nodeHasDimension = (node) => node.height !== undefined && node.width !== undefined;

const Visualizer = ({ vSchema }) => {
  // State management for a controlled react-flow
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  // const [shouldGraph, setShouldGraph] = useState(true);
  const shouldGraph = useRef(true);
  // Memoized (cached) event listeners to prevent unnecessary re-renders
  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const nodesInitialized = useNodesInitialized();
  const store = useStoreApi();

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
    // const graphedNodes = createGraphLayout(newNodes);
    shouldGraph.current = true;
    setNodes(newNodes);
    // setNodes(graphedNodes);
    // setEdges([]);
  }, [vSchema]);



  // useEffect(() => {
  //   // if (nodesInitialized && shouldGraph) {
  //   //   console.log('in use effect, nodes is: ', nodes);
  //   //   const graphedNodes = createGraphLayout(nodes);
  //   //   // setNodes(graphedNodes);
  //   //   // setShouldGraph(false);
  //   // }
  //   for (const node of nodes) {
  //     console.log('current node is: ', node, ' nodHasDimension? ', nodeHasDimension(node));
  //   }
  // }, [nodes]);

  useEffect(() => {
    if (nodesInitialized && shouldGraph.current) {
      const { nodeInternals } = store.getState();
      const currNodes = Array.from(nodeInternals.values());
      // The node printed here won't have a width or height in some cases
      // console.log('currnodes: ', currNodes);
      const graphedNodes = createGraphLayout(currNodes);
      setNodes(graphedNodes);
      shouldGraph.current = false;
    }
  }, [nodesInitialized, store]);


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
          // edgeTypes={edgeTypes}
          fitView={true}
          panOnScroll={true}
          zoom={1}
          minZoom={.1}
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