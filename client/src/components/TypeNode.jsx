import React, { memo, useEffect, useState } from "react";
import { Handle, useUpdateNodeInternals } from "reactflow";
import Field from "./Field";

const containerStyle = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#fff",
  transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
  boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  fontSize: "10pt",
  position: "relative",
  minWidth: 150,
};

const containerStyleActive = {
  border: "2px solid lightgreen",
};

const typeHeading = {
  padding: `8px 32px`,
  flexGrow: 1,
  backgroundColor: "#eee",
  textAlign: `center`,
};

const TypeNode = ({ data }) => {
  const {
    typeName,
    fields,
    updateEdge,
    active,
    activeFieldIDs,
    displayMode,
    visualizerOptions,
  } = data;
  const [fieldElements, setFieldElements] = useState();

  const { targetPosition } = visualizerOptions;

  // Any time the active field ID's change, remap the fields
  useEffect(() => {
    setFieldElements(
      fields.map((field) => (
        <Field
          key={`${typeName}/${field.fieldName}`}
          id={`${typeName}/${field.fieldName}`}
          typeName={typeName}
          fieldName={field.fieldName}
          returnType={field.returnType}
          updateEdge={updateEdge}
          relationship={field.relationship}
          active={
            activeFieldIDs?.has(`${typeName}/${field.fieldName}`) ? true : false
          }
          displayMode={displayMode}
      />
      ))
    );
  }, [activeFieldIDs]);


  // creating "altHandles" -- a collection of source handles with the EXACT same ID as field source handles, rendered whenever the field collapses (edges automatically snap to them)
  const [altHandles, setAltHandles] = useState()
  useEffect(() => {
    setAltHandles(
      fields.map((field) => (
        <Handle 
          type="source"
          position="right"
          id={`${typeName}/${field.fieldName}`}
          isConnectable={false}
          style={{position: 'absolute'}}
        />
      ))
    );
  }, []);
      
    

  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className="type-node"
      style={
        active ? { ...containerStyle, ...containerStyleActive } : containerStyle
      }
    >
      {typeName !== "Root" && typeName !== "Query" && (
        <Handle
          type="target"
          position={targetPosition === "left" ? "left" : "top"}
          id={typeName}
          isConnectable={false}
          className={
            targetPosition === "left"
              ? "type-node__handle-target-left"
              : "type-node__handle-target-top"
          }
        />
      )}
      {collapsed && altHandles}
      <div className="type-node__container">
        <div onClick={() => setCollapsed(!collapsed)} style={typeHeading}>{typeName}</div>
        {!collapsed && <div className="type-node__fields-container">{fieldElements}</div>}
      </div>
    </div>
  );
};

export default memo(TypeNode);
