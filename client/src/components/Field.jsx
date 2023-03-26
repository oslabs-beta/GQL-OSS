import React, { memo, useEffect, useState } from 'react';
import { Handle } from 'reactflow';
import { MarkerType, useNodes, useUpdateNodeInternals } from 'reactflow';


const field = {
  position: `relative`,
  padding: `8px 16px`,
  flexGrow: 1,
  textAlign: `center`,
};

const fieldData = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
};

const Field = ({ typeName, fieldName, returnType, updateEdge, relationship }) => {
  const nodes = useNodes();
  const updateNodeInternals = useUpdateNodeInternals();
  const [handlePosition, setHandlePosition] = useState('right');
  // const [targetNode, setTargetNode] = useState(null);
  // const [currNode, setCurrNode] = useState(null);

  useEffect(() => {
    // for our vSchema:
    // relationship is a key on a field object that only exists if that field points to a type
    // its value corresponds 1:1 to the object type name and its node's id
    if (relationship) {

      const targetType = relationship;

      updateEdge({
        id: `${typeName}/${fieldName}-${targetType}`,
        source: typeName,
        sourceHandle: `${typeName}/${fieldName}`,
        target: targetType,
        // smooth: true,
        // type: 'smart',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'cornflowerblue',
          width: 20,
          height: 20,
          strokeWidth: .3
        },
        // animated: true,
        style: { stroke: 'cornflowerblue' },
      });
    }
  }, []);

  // I originally tried to store curr and target nodes in state
  // and assign them only once in useEffect, however ... that created
  // all sorts of unintended behavior
  // You'd think it'd be easier that way ... it seems 'references' got lost in state
  // So here, we're 'brute forcing' instead.
  if (relationship) {
    const targetNode = nodes.find(node => node.id === relationship);
    const currNode = nodes.find(node => node.id === typeName);
    const targetPosition = targetNode.position;
    const currPosition = currNode.position;
    if (currPosition.x > targetPosition.x && handlePosition !== 'left') {
      setHandlePosition('left');
      updateNodeInternals(typeName);
    } else if (currPosition.x < targetPosition.x && handlePosition !== 'right') {
      setHandlePosition('right');
      updateNodeInternals(typeName);
    }
  }

  return (
    <div style={field}>
      <div style={fieldData}>
        <p className="field-name">{fieldName}</p>
        <p className="return-type">{returnType}</p>
      </div>
      { relationship &&
        <Handle type="source" position={handlePosition} isConnectable={false} id={`${typeName}/${fieldName}`} />
      }
    </div>
  );
};

export default memo(Field);
