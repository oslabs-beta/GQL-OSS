import React, { memo, useEffect } from 'react';
import { Handle } from 'reactflow';
import { MarkerType } from 'reactflow';

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
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'cornflowerblue',
          width: 20,
          height: 20,
          strokeWidth: .3
        },
        animated: true,
        style: { stroke: 'cornflowerblue' },
      });
    }
  }, []);

  return (
    <div style={field}>
      <div style={fieldData}>
        <p className="field-name">{fieldName}</p>
        <p className="return-type">{returnType}</p>
      </div>
      <Handle type="source" position="right" isConnectable={false} id={`${typeName}/${fieldName}`} />
    </div>
  );
};

export default memo(Field);
