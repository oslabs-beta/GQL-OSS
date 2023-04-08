import React, { useContext, useState } from "react";

import ReverseContext from "../context/ReverseContext";

const CollisionPrompt = () => {
  const { revClickedField, setRevClickedField, revActiveRelationships } =
    useContext(ReverseContext);

  //Are args poissble in collisions? Args only occur in Query/Mutation types, and these only ever have one relationship pointing to them, so probs not.
  const { fieldName, typeName, relationship, args } = revClickedField;

  //******** COLLISION MANAGEMENT HERE*******//
  //BIG PICTURE: get info user to build user interface so they help us resolve a collision

  //rebuilt string created a string w/ the different options the user has, of which the user will click one, and that one will become the new string that the findCorrectReference utils func will use to look up as the reference for the selected field
  const rebuiltStr = revActiveRelationships.get(typeName).reduce((acc, cur) => {
    const strForEachField = `  "${cur.field}" in ${cur.type}\n`;
    return acc + strForEachField;
  }, ``);

  //prompt the user
  //TODO: This fieldName + vars String will create a BAD UX/UI when collisions occur and the field name w/ vars (only for query and mutations field) appears for the user to select. Gonna have to filter out the parenthesis and the chars within it, and then make sure if the user selects THAT field, field w/ vars, to resolve the collision, that the parenthesis and its contexts are present in the response to the logic too, since that field is actually saved as a reference w/ those vars, for convenience
  const userClarification = prompt(
    `User has to click which relationship to follow!\nClick field "${fieldName}" can go into the following query fields:\n${rebuiltStr}Please choose one!`
  );
  //creates vars for the field and its type that the user has selected. userClarifiedType will be used when updating the rev current fields below, when reverse mode state is being updated when handling a collision
  const [userClarifiedField, userClarifiedType] = userClarification.split(`/`);

  //received value from user, now find the correct reference using recursive func
  const [reference, isRevRoot, isOperation] = findCorrectReference(
    userClarifiedField,
    revQueryObjUpdated,
    revActiveRelationships,
    revCurFields,
    userClarification,
    fieldName
  );

  //push user selected field (the prompt value) into the outter most arr of revQueryObjUpdated.current, which will be found as the val of the reference var
  if (isRevRoot) {
    if (relationship) {
      //in the outter most arr of rev query
      //since new relationship will be formed, empty arr will represent store where future fields can be placed inside
      reference.push({ [fieldName]: [] });
    } else {
      //scalar was selected. Only need to push inside the ref
      reference.push(fieldName);
    }
  } else {
    //Not in outter most arr of rev query. reference will be a nested arr or obj(depending on the depth) inside revQueryObjUpdate.current
    //handles scenario where in a collision, the field chosen has a relationship but is NOT in a object w/ the key "operation"
    if (relationship && !isOperation) {
      reference[userClarifiedField].push({ [fieldName]: [] });
    } else if (relationship && isOperation) {
      //handles scenario where in a collision, the field chosen has a relationship and IS in a object w/ the key "operation"
      reference.fields.push({ [fieldName]: [] });
    } else if (!relationship && isOperation) {
      //at this point, have handled all possible collisions where field names have relationships. Below is code handling the pushing into reference the field names of the collisions that are SCALARS
      //this condition handles a scalar being pushed into the fields arr that's within an obj w/ the key name "operation"
      reference.fields.push(fieldName);
    } else {
      //this condition handles a scalar being pushed into the fields arr that's NOT within an obj w/ the key name "operation"
      reference[userClarifiedField].push(fieldName);
    }
  }

  // *************************************** //
  //***** UPDATE REVERSE MODE STATE ******/ //
  // *************************************** //

  setRevActiveRelationships((prevRevActiveRelations) => {
    const updatedMap = new Map(
      JSON.parse(JSON.stringify(Array.from(prevRevActiveRelations)))
    );
    const mapValue = updatedMap.get(relationship);

    // check if map at relationship already exists and has length

    //if so, push into arr for that type's active relationships. This case will be useful in signalling that a collision will occur if a field is clicked in the type that now has more than 1 relationship. Note that if currently mapValue length is 1, and it's currently being updated meaning that after it is update it will be two meaning a collion is set to occur.
    if (mapValue && mapValue.length > 0) {
      mapValue.push({
        field: fieldName,
        type: typeName,
      });
      //if not, just create new map key/val pair, with key being the relationship and val and array w/ object w/ corresponding fields
    } else if ((mapValue && mapValue.length === 0) || !mapValue) {
      updatedMap.set(relationship, [{ field: fieldName, type: typeName }]);
    }
    return updatedMap;
  });

  //update rev active types n fields
  const curType = revActiveTypesNFields[typeName].slice();
  curType.push(fieldName);

  //Use checkForDuplicate num to determine if a duplicate type will come up. Eg say Continent: [countries]
  //and Country: [emojie] already exists. If we then click State: [country],
  //Country already has an array, the fields array needs to be pushed into instead of overriden
  const checkForDuplicate =
    revActiveRelationships.get(relationship)?.length + 1;

  setRevActiveTypesNFields((prevRevTypesNFields) => {
    if (relationship) {
      //handle if there's a duplicate for the relationship
      if (checkForDuplicate > 1) {
        return {
          ...prevRevTypesNFields,
          [typeName]: curType,
        };
      } else {
        return {
          ...prevRevTypesNFields,
          [typeName]: curType,
          [relationship]: [],
        };
      }
    } else {
      //No relationship, clicked field was a scalar. Scalars do not have relationships so duplicate not possible
      return {
        ...prevRevTypesNFields,
        [typeName]: curType,
      };
    }
  });

  //update rev current fields
  //get the string names of the rootField and rootType, that is, where the user has clarified that the selected field should go inside. These string vars will be useful in accessing the reference for the revCurFields for the specific field/Type reference the user has clarified.
  const { field: rootField, type: rootType } = revActiveRelationships
    .get(typeName)
    .find((type) => {
      if (
        userClarifiedField === type.field &&
        userClarifiedType === type.type
      ) {
        return type;
      } else {
        // is there a case where this doesn't return anything??
      }
    });

  const revCurFieldName = `${rootField}/${rootType}`;

  //need to grab the same array of the parent/root field in the revCurFields obj and push
  const curFieldCopy = revCurFields[revCurFieldName].slice();
  curFieldCopy.push(fieldName);

  setRevCurFields((prevRevCurFields) => {
    if (relationship) {
      const curFieldRelationshipName = `${fieldName}/${typeName}`;
      return {
        ...prevRevCurFields,
        [revCurFieldName]: curFieldCopy,
        [curFieldRelationshipName]: [],
      };
    } else {
      //since no relationship exists in this case, no relationship key/val pair will be added
      return {
        ...prevRevCurFields,
        [revCurFieldName]: curFieldCopy,
      };
    }
  });

  //update rev query obj
  setRevQueryObj([...revQueryObjUpdated.current]);
  return;
  //******** END OF COLLISION MANAGEMENT HERE*******//

  return (
    <div>
      <button></button>
    </div>
  );
};

export default CollisionPrompt;
