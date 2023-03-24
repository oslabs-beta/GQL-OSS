import React, { memo } from 'react';
import { Handle } from 'reactflow';

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

const Field = ({ fieldName, returnType }) => {
  // console.log(linkTo);
  //WHAT NEEDS TO HAPPEN IS WHEN LINKTO IS TRUE, A NEW EDGE NEEDS TO BE MADE
  // THE NEW NODE NEEDS TO HAVE THE TABLENAME AND COLUMN NAME FOR THE SOURCE
  // THE NEW NODE ALSO NEEDS THE TABLENAME AND THE COLUMN NAME FOR THE TARGET

  return (
    <div style={field}>
      {/* isPrimaryKey && !linkTo && */}
      { (
        <Handle type="target" position="left" id={fieldName} />
      )}

      <div style={fieldData}>
        <p className="name">{fieldName}</p>
        <p className="data-type">{returnType}</p>
      </div>
      {/* linkTo && !isPrimaryKey && */}
      { (
        <Handle type="source" position="right" id={fieldName} />
      )}
    </div>
  );
};

export default memo(Field);
