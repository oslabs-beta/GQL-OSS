import React, { memo, useEffect, useState, useContext, useRef } from "react";
import { Handle } from "reactflow";
import {
  MarkerType,
  useNodes,
  useUpdateNodeInternals,
  useStoreApi,
} from "reactflow";
import ReverseContext from "../context/ReverseContext";
import "../styles/Field.css";
import CollisionModal from "./CollisionModal";

const Field = ({
  typeName,
  fieldName,
  returnType,
  args,
  updateEdge,
  relationship,
  active,
  fieldHighlightColor,
  edgeDefaultColor,
}) => {
  /********************************************************** State *******************************************************/

  /* State pertaining to dynamic handles */
  /* Unfortunately, useNode(id) is deprecated in modern React Flow
  It would have made it easier to performantly use dynamic handles for large schemas.
  Only remnant is a much less performant useNodes hook which was the first approach.
  It worked well for smaller schemas, but testing led us to restrict dynamic handle functionality
  to below a certain threshold */
  const updateNodeInternals = useUpdateNodeInternals();
  const [handlePosition, setHandlePosition] = useState("right");
  const store = useStoreApi();
  const { nodeInternals } = store.getState();
  const numNodes = useRef(Array.from(nodeInternals.values()).length);
  let nodes;
  if (numNodes.current < 10) nodes = useNodes();

  const [collisionModalOpen, setCollisionModalOpen] = useState(false);
  const [collisionRelationships, setCollisionRelationships] = useState([]);
  const {
    setRevClickedField,
    revActiveTypesNFields,
    revActiveRelationships,
    reverseMode,
    setReverseModeError,
  } = useContext(ReverseContext);

  const fieldActive = {
    backgroundColor: fieldHighlightColor + "ca",
  };

  /********************************************************** useEffect's *******************************************************/

  /* Initialize an edge (arrow) from this field to its proper target, if this field has a relationship */
  // In vSchema:
  // 'Relationship' is a key on a field object that only exists if that field points to a Type.
  // Its value corresponds 1:1 to the object type name and its node's id
  // i.e. if the relationship is 'Continent,' then that field should have an edge pointing to the
  // 'Continent' node
  useEffect(() => {
    if (
      relationship &&
      !store
        .getState()
        .edges.some(
          (edge) => edge.id === `${typeName}/${fieldName}-${relationship}`
        )
    ) {
      const targetType = relationship;
      updateEdge({
        id: `${typeName}/${fieldName}-${targetType}`,
        source: typeName,
        sourceHandle: `${typeName}/${fieldName}`,
        target: targetType,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeDefaultColor,
          width: 28,
          height: 28,
          strokeWidth: 0.7,
        },
        style: {
          stroke: edgeDefaultColor,
          strokeWidth: "1.1",
        },
        hidden: false,
        active: false,
        isGhost: false,
      });
    }
  }, []);

  /********************************************************** Helper Fn's *******************************************************/

  /* Dynamically shift around the handles */
  // (only under a certain number of nodes for performance)
  // React Flow API is limited in terms of how to selectively watch nodes
  // Unfortunately the useNode(<id>) hook is deprecated ... so very limited usage of useNodes() must be used instead
  if (relationship && nodes) {
    const targetNode = nodes.find((node) => node.id === relationship);
    const currNode = nodes.find((node) => node.id === typeName);
    const targetPosition = targetNode.position;
    const currPosition = currNode.position;
    if (currPosition.x > targetPosition.x && handlePosition !== "left") {
      setHandlePosition("left");
      updateNodeInternals(typeName);
    } else if (
      currPosition.x < targetPosition.x &&
      handlePosition !== "right"
    ) {
      setHandlePosition("right");
      updateNodeInternals(typeName);
    }
  }

  /* If Reverse Mode is active, feed the information into Reverse Context, and handle collisions accordingly */
  /* A 'collision' is when a field is clicked but it is ambiguous which route the user wishes to add it in */
  /* (The clicks can be in any order) */
  const reverseClickHandler = () => {
    if (!reverseMode) return;
    if (revActiveTypesNFields === null || revActiveTypesNFields[typeName]) {
      const curRevActiveRelationships = revActiveRelationships?.get(typeName);
      const numberOfActiveRelationships = curRevActiveRelationships?.length;

      const fieldInfo = { typeName, fieldName, relationship, args };
      if (numberOfActiveRelationships > 1) {
        setCollisionRelationships(curRevActiveRelationships);
        setCollisionModalOpen(true);
      } else {
        setRevClickedField(fieldInfo);
      }
    } else {
      setReverseModeError("There are no possible active routes to this field");
    }
  };

  /********************************************************** Render *******************************************************/

  return (
    <div>
      <div
        className={`field ${active ? "active" : ""} ${
          reverseMode ? "reverse-mode" : ""
        }`}
        style={active ? fieldActive : {}}
        onClick={reverseClickHandler}
      >
        <div className="field-data">
          <p className="field-name">{fieldName}</p>
          <p className="return-type">{returnType}</p>
        </div>
        {relationship && (
          <Handle
            type="source"
            position={handlePosition}
            isConnectable={false}
            id={`${typeName}/${fieldName}`}
          />
        )}
      </div>
      {collisionModalOpen && (
        <CollisionModal
          open={collisionModalOpen}
          setOpen={setCollisionModalOpen}
          relationships={collisionRelationships}
          fieldInfo={{ typeName, fieldName, relationship, args }}
        />
      )}
    </div>
  );
};

export default memo(Field);
