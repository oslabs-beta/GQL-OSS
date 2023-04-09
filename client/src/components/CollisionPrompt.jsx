import React, { useContext, useEffect, useState } from "react";

import ReverseContext from "../context/ReverseContext";

const CollisionPrompt = ({ fieldInfo }) => {
  const { setRevClickedField, revActiveRelationships } =
    useContext(ReverseContext);
  const [collisionClarifiedObj, setCollisionClarifiedObj] = useState(null);

  const { fieldName, typeName, relationship, args } = fieldInfo;

  useEffect(() => {
    //rebuilt string created a string w/ the different options the user has, of which the user will click one, and that one will become the new string that the findCorrectReference utils func will use to look up as the reference for the selected field
    const rebuiltStr = revActiveRelationships
      .get(typeName)
      .reduce((acc, cur) => {
        const strForEachField = `  "${cur.field}" in ${cur.type}\n`;
        return acc + strForEachField;
      }, ``);

    //prompt the user
    //TODO: This fieldName + vars String will create a BAD UX/UI when collisions occur and the field name w/ vars (only for query and mutations field) appears for the user to select. Gonna have to filter out the parenthesis and the chars within it, and then make sure if the user selects THAT field, field w/ vars, to resolve the collision, that the parenthesis and its contexts are present in the response to the logic too, since that field is actually saved as a reference w/ those vars, for convenience
    const userClarification = prompt(
      `User has to click which relationship to follow!\nClick field "${fieldName}" can go into the following query fields:\n${rebuiltStr}Please choose one!`
    );

    setCollisionClarifiedObj({
      userClarification,
      relationship,
      isClarifiedField: true,
      typeName,
      fieldName,
    });
  }, []);

  useEffect(() => {
    // console.log(`collisionClarifiedObj IS: `, collisionClarifiedObj);
    setRevClickedField(collisionClarifiedObj);
  }, [collisionClarifiedObj]);

  /*
  DESIRED OUTPUT SHOULD TAKE ON THIS SHAPE:  "FIELDNAME/TYPENAME": STRING. The below code is how this value will be handled by the reverse mode logic. ALSO... DESIRED OUTPUT should send notice of there is a relationship AND if this is a user-clarified selected field. Reserve mode logic will ALSO need the typeName and fieldName properties of the original click. These are currently available via a prop passed into this compoent, but should also be found in the global state const called revClickedField. Put all this in an obj: ie. { userClarification, relationship, isClarifiedField, fieldName, typeName }. Must make sure to do obj destructuring when this obj is received in the reverse mode logic
  const [userClarifiedField, userClarifiedType] = userClarification.split(`/`);
  */

  return (
    <div
      style={{
        display: `none
    `,
      }}
    ></div>
  );
};

export default CollisionPrompt;
