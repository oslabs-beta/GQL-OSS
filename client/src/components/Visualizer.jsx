import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow,
{ Background,
  Controls,
  MiniMap,
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  SelectionMode
} from 'reactflow';

import 'reactflow/dist/style.css';
import TypeNode from './TypeNode';
import {schema} from '../testdata/visualizerSchema';

const vSchema = schema.visualizerSchema;

const nodeTypes = {
  typeNode: TypeNode,
};
console.log('schema is: ', schema);

const Visualizer = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    const newNodes = vSchema.objectTypes.map((type, i) => ({
      id: type.name,
      position: { x: i * 300, y: 0 }, //refactor this to be autospaced with a library(?)
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
  }, []);

  // useEffect(() => {
  //   tables.forEach((tableData, i) => {
  //     const newNode = {
  //       id: tableData.tableName,
  //       position: { x: i * 300, y: 0 },
  //       data: {
  //         tableData,
  //         updateEdge: (newEdge) => {
  //           setEdges((prev) => [...prev, newEdge]);
  //         },
  //       },
  //       type: `tableNode`,
  //     };

  //     setNodes((prev) => {
  //       return [...prev, newNode];
  //     });
  //   });
  // }, [tables]);


  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div className='visualizer-container'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Visualizer;