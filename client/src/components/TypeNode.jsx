import React, { memo, useEffect, useState } from "react";
import { Handle, useUpdateNodeInternals } from "reactflow";
import Field from "./Field";
import "../styles/TypeNode.css";

const TypeNode = ({ data }) => {
  const {
    typeName,
    fields,
    updateEdge,
    active,
    activeFieldIDs,
    displayMode,
    visualizerOptions,
    customColors,
    isGhost,
  } = data;
  const [fieldElements, setFieldElements] = useState();

  const { targetPosition } = visualizerOptions;

  // const containerStyleActive = {
  //   border: `2px solid ${customColors["nodeHighlight"]}`,
  // };

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
          args={field.args}
          updateEdge={updateEdge}
          relationship={field.relationship}
          fieldHighlightColor={customColors["fieldHighlight"]}
          edgeDefaultColor={customColors["edgeDefault"]}
          active={
            activeFieldIDs?.has(`${typeName}/${field.fieldName}`) ? true : false
          }
          displayMode={displayMode}
        />
      ))
    );
  }, [activeFieldIDs, customColors]);

  // creating "altHandles" -- a collection of source handles with the EXACT same ID as field source handles, rendered whenever the field collapses (edges automatically snap to them)
  const [altHandles, setAltHandles] = useState();
  useEffect(() => {
    setAltHandles(
      fields.map((field) => (
        <Handle
          type="source"
          position="right"
          id={`${typeName}/${field.fieldName}`}
          isConnectable={false}
          style={{ position: "absolute" }}
        />
      ))
    );
  }, []);

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`type-node ${active ? "gradient-border2" : ""}`}>
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
        <div onClick={() => setCollapsed(!collapsed)} className="type-heading">
          {typeName}
        </div>
        {!collapsed && (
          <div className="type-node__fields-container">{fieldElements}</div>
        )}
      </div>
    </div>
  );
};

export default memo(TypeNode);
