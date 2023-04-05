import React, { createContext, useState, useRef, useEffect } from "react";

import * as gqlQB from "gql-query-builder";
import formatReverseQuery from "../utils/formatReverseQuery";
import findCorrectReference from "../utils/findCorrectReference";

const ReverseContext = createContext();

export const ContextProvider = ({ children }) => {
  const [revQueryObj, setRevQueryObj] = useState(null);
  const [revActiveTypesNFields, setRevActiveTypesNFields] = useState(null);
  const [revQueryType, setRevQueryType] = useState(null);
  const [revActiveRelationships, setRevActiveRelationships] = useState(null);
  const [revClickedField, setRevClickedField] = useState(null);

  console.log(`revQueryObj: `, revQueryObj);
  console.log("revActiveTypesNFields:", revActiveTypesNFields);
  console.log(`revActiveRelationships: `, revActiveRelationships);

  const revQueryObjUpdated = useRef(revQueryObj);

  useEffect(() => {
    if (revQueryObj) {
      const { query } = gqlQB.query(revQueryObj);
      const formatted = formatReverseQuery(query);
      console.log(`OUTPUT IS BELOW: `);
      console.log(formatted);
    }
    revQueryObjUpdated.current = revQueryObj;
  }, [revQueryObj]);

  useEffect(() => {
    if (revClickedField === null) return;

    const { fieldName, typeName, relationship } = revClickedField;

    // STEP#1
    //If reverse mode state is null, Query/mutation field has not been click yet
    //while in reverse mode
    if (
      revQueryObjUpdated.current === null &&
      revActiveRelationships === null &&
      revActiveTypesNFields === null &&
      revQueryType === null
    ) {
      // Handle first click
      //Create Object#1
      //create innitial query obj that graphql-query-builder will receive
      const revQueryRoot = {
        operation: fieldName,
        fields: [],
      };

      //Create Object#2
      //create map that will hold all active relationships between types and the fields that attach to them
      const revRelationships = new Map();
      // Query/root type always connects to others, but is never connected to. Empty array represents this
      revRelationships.set(typeName, []);
      // include selected type with relationship as key and value as array of the related fields. Note the
      //array holds nested objs for each field, including the field name and its corresponding type
      revRelationships.set(relationship, [
        { field: fieldName, type: typeName },
      ]);

      //Create Object#3
      //created obj to hold a record of all active types and fields/ This is dif than the above Object#2,
      //which catalogs the active RELATIONSHIPS, because it just stores all the types and their corresponding fields
      const actives = {
        [typeName]: [fieldName],
        [relationship]: [],
      };

      //initialize reverse mode first active state
      setRevQueryObj(revQueryRoot);
      setRevActiveTypesNFields(actives);
      setRevActiveRelationships(revRelationships);
      setRevQueryType(typeName.toLowerCase());
      //return to end operation
      return;
    }

    // Above conditional was NOT met
    //If we've reached here the reverse query has already begun, so you just need to
    //add the appropriate fields and shit into their place

    //Conditional check below...
    // a field's objectType has to exist in reverseActiveTypes in order to proceed
    // with the current implementation in Field.jsx (see reverseClickHandler func specifically the if/else statement),
    //I believe the below condition check may be unnecessary. Still, doesn't hurt to have it here just to double
    //check that we're checking for only active types if we're going to be adding it to the query obj
    if (!revActiveRelationships.has(typeName)) return;

    //First field(s) after rev mode init, that is after clicking Quer/Root objType, and picking query or mutation is easy.
    //just push into the fields array create on STEP#1
    // STEP#2
    if (revActiveRelationships.size === 2) {
      //add to rev active types n fields
      //create a copy of the current fields of the current type
      const curType = revActiveTypesNFields[typeName].slice();
      //push current field name into array copy
      curType.push(fieldName);

      //check if field has relationship
      if (relationship) {
        revQueryObjUpdated.current.fields.push({ [fieldName]: [] });
        //add relationship to reverseActiveTypes
        setRevActiveRelationships((prevRevActiveRelations) => {
          //create a DEEP clone of the map. Otherwise, map properties will not update properly
          //since the values are all nested arrays/refs. Trust me.. I tried that lol.
          const updatedMap = new Map(
            JSON.parse(JSON.stringify(Array.from(prevRevActiveRelations)))
          );
          updatedMap.set(relationship, [{ field: fieldName, type: typeName }]);
          return updatedMap;
        });
      } else {
        //no relationship, just push into fields array that was created on // STEP#1
        revQueryObjUpdated.current.fields.push(fieldName);
      }
      //update reserve mode state
      setRevActiveTypesNFields((prevRevTypesNFields) => {
        if (relationship) {
          //if there was a relationship, empty array represents the new "store" in which
          //future new fields belonging to that newly active obj type will be placed/stored in
          //Notice that curType is just a shallow copy (I don't think deep copy was necessary) of the previous entries for the current
          //obj type. It has been updated by pushing the current field into it
          return {
            ...prevRevTypesNFields,
            [typeName]: curType,
            [relationship]: [],
          };
        } else {
          //since no relationship exists in this case, no relationship key/val pair will be added
          return {
            ...prevRevTypesNFields,
            [typeName]: curType,
          };
        }
      });
      //reassign query Obj
      setRevQueryObj({ ...revQueryObjUpdated.current });
      //return to end operation
      return;
    }

    // STEP#3 THE BIGGGGG ONE!!!!
    //In this step, we are keep track of the DEPTH of the fields property in the query obj.
    //Nested in here is where MOST of the fields will live.
    if (revActiveRelationships.size > 2) {
      const numberOfActiveRelationships =
        revActiveRelationships.get(typeName).length;
      if (numberOfActiveRelationships > 1) {
        //******** WORK IN PROGRESS... DOING COLLISION MANAGEMENT HERE*******//
        const rebuiltStr = revActiveRelationships
          .get(typeName)
          .reduce((acc, cur) => {
            const strForEachField = `  "${cur.field}" in ${cur.type}\n`;
            return acc + strForEachField;
          }, ``);
        console.log(`rebuiltStr IS: `, rebuiltStr);

        alert(
          `User has to click which relationship to follow!\nClick field "${fieldName}" can go into the following query fields:\n${rebuiltStr}Please choose one!`
        );
        //******** WORK IN PROGRESS... DOING COLLISION MANAGEMENT HERE*******//
      }

      // Below in findCorrectReference func, we will recursively finding the reference/pointer
      //to the key that holds the corresponding array/field store. Once you have
      //that pointer/reference, you will be able to just push into it.
      // TO DO: Will need to fine tune this to ensure references are ALWAYS correct

      // get reference/pointer
      const [referenceObj] = revActiveRelationships.get(typeName);
      const referenceStr = referenceObj.field;

      //if clicked field does not have a relationship, reference will be null
      //since recursive funtion findCorrectReference did not find a relationship association to it, since it's a scalar
      const [reference, isOperation] = findCorrectReference(
        referenceStr,
        revQueryObjUpdated,
        revQueryObj
      );
      // console.log(`reference: `, reference);

      if (relationship) {
        // if newly clicked field has refenrece, repeat the above idea where you create a new obj w/ field name as key
        //and values is an empty arr
        //add relationship to reverseActiveTypes
        setRevActiveRelationships((prevRevActiveRelations) => {
          const updatedMap = new Map(
            JSON.parse(JSON.stringify(Array.from(prevRevActiveRelations)))
          );
          const mapValue = updatedMap.get(relationship);

          // check if map at relationship already exists and has length
          //if so, push into it
          //if not, just create new map key/val pair, with key being the relationship and val and array w/ object w/ corresponding fields
          if (mapValue && mapValue.length > 0) {
            mapValue.push({
              field: fieldName,
              type: typeName,
            });
          } else {
            updatedMap.set(relationship, [
              { field: fieldName, type: typeName },
            ]);
          }

          return updatedMap;
        });

        //Since there was a relationship, recursive function found the reference in the
        // current query obj
        reference[referenceStr].push({ [fieldName]: [] });
      } else {
        //No relationship, so, SCALAR! Get current picture current/clicked field's objType relationship reference.
        //This will be an array
        const clickedFieldTypeRelationship =
          revActiveRelationships.get(typeName);

        //if the num (length) of the relationships is more than 1, have to promp further user input
        if (clickedFieldTypeRelationship.length > 1) {
          //******** WORK IN PROGRESS... DOING COLLISION MANAGEMENT HERE*******//
          alert(`SOME SORT OF USER INPUT`);
          //******** WORK IN PROGRESS... DOING COLLISION MANAGEMENT HERE*******//

          // if length is less than 1 get corresponding reference for current/clicked field via recursive function
        } else if (clickedFieldTypeRelationship.length <= 1) {
          const [reference, isOperation] = findCorrectReference(
            clickedFieldTypeRelationship[0].field,
            revQueryObjUpdated,
            revQueryObj
          );
          // console.log(`reference IS: `, reference);
          // console.log(`isOperation IS: `, isOperation);

          //operation's ref will be to the opening array of the revQueryObj arr. It's a particular case
          if (isOperation) {
            reference.push(fieldName);
          } else {
            //These references are found nested in the fields array, from the originally made revQueryRoot obj in Step#1
            reference[clickedFieldTypeRelationship[0].field].push(fieldName);
          }
        }
      }

      //UPDATE THAT REVERSE MODE STATE
      //add to rev active types n fields
      const curType = revActiveTypesNFields[typeName].slice();
      curType.push(fieldName);

      //Use checkForDuplicate num to determine if a duplicate type will come up. Eg say Continent: [countries]
      //and Country: [emojie] already exists. If we then click State: [country],
      //Country already has an array, the fields array needs to be pushed into instead of overriden
      const checkForDuplicate =
        revActiveRelationships.get(relationship)?.length + 1;

      setRevActiveTypesNFields((prevRevTypesNFields) => {
        if (relationship) {
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
          return {
            ...prevRevTypesNFields,
            [typeName]: curType,
          };
        }
      });
      //update revQueryObj
      setRevQueryObj({ ...revQueryObjUpdated.current });
    }
  }, [revClickedField]);

  return (
    <ReverseContext.Provider
      value={{
        revQueryObj,
        setRevQueryObj,
        setRevClickedField,
        revActiveTypesNFields,
        revActiveRelationships,
      }}
    >
      {children}
    </ReverseContext.Provider>
  );
};

export default ReverseContext;
