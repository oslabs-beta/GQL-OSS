import React, { memo, useEffect, useState } from 'react';
import { Handle, useUpdateNodeInternals } from 'reactflow';
import Field from './Field';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  fontSize: '10pt',
  position: 'relative',
  minWidth: 150,
};

const containerStyleActive = {
  border: '2px solid lightgreen',
};

const typeHeading = {
  padding: `8px 32px`,
  flexGrow: 1,
  backgroundColor: '#eee',
  textAlign: `center`,
};

const TypeNode = ({ data }) => {
  const { typeName, fields, updateEdge, active, activeFieldIDs} =  data;
  const [fieldElements, setFieldElements] = useState();

  // Any time the active field ID's change, remap the fields
  useEffect(() => {
    setFieldElements(fields.map(field => (
      <Field
        key={`${typeName}/${field.fieldName}`}
        id={`${typeName}/${field.fieldName}`}
        typeName={typeName}
        fieldName={field.fieldName}
        returnType={field.returnType}
        updateEdge={updateEdge}
        relationship={field.relationship}
        active={activeFieldIDs?.has(`${typeName}/${field.fieldName}`) ? true : false}
      />
    )));
  }, [activeFieldIDs]);

  return (
    <div style={active ? {...containerStyle, ...containerStyleActive} : containerStyle}>
      { typeName !== 'Root' && typeName !== 'Query' &&
        <Handle type="target" position="top" id={typeName} isConnectable={false}/>
      }
      <div className="type-node__container">
        <div style={typeHeading}>{typeName}</div>
        <div className="type-node__fields-container">{fieldElements}</div>
      </div>
    </div>
  );
};

export default memo(TypeNode);
