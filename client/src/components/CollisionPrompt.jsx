import React, { useContext } from "react";

import ReverseContext from "../context/ReverseContext";

const CollisionPrompt = () => {
  const { setRevClickedField, revActiveRelationships } =
    useContext(ReverseContext);

  return (
    <div>
      <button></button>
    </div>
  );
};

export default CollisionPrompt;
