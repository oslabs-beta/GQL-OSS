import React, { memo, useEffect, useState } from 'react';
import { Handle } from 'reactflow';
import Field from './Field';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#fff',
  transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  border: '0px solid #bbb',
  fontSize: '10pt',
  position: 'relative',
  minWidth: 150,
};

const typeHeading = {
  padding: `8px 32px`,
  flexGrow: 1,
  backgroundColor: '#eee',
  textAlign: `center`,
};

const TypeNode = ({ data }) => {
  const { typeName, fields, updateEdge } =  data;
  const [fieldElements, setFieldElements] = useState();

  useEffect(() => {
    setFieldElements(fields.map(field => (
      <Field
        key={`${typeName}/${field.fieldName}`}
        typeName={typeName}
        fieldName={field.fieldName}
        returnType={field.returnType}
        updateEdge={updateEdge}
        relationship={field.relationship}
      />
    )));
  }, []);


  return (
    <div className="type-node" style={containerStyle}>
      { typeName !== 'Root' && typeName !== 'Query' &&
        <Handle type="target" position="top" id={typeName} isConnectable={false}/>
      }
      <div className="type-node__container">
        <div style={typeHeading}>{typeName}</div>
        <div className="type-node__columns-container">{fieldElements}</div>
      </div>
    </div>
  );
};

export default memo(TypeNode);
