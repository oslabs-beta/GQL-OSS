import React, { createContext, useState, useRef, useEffect } from "react";

import * as gqlQB from "gql-query-builder";
import formatReverseQuery from "../utils/formatReverseQuery";
import findCorrectReference from "../utils/findCorrectReference";

const ReverseContext = createContext({});
const ReverseContext = createContext({});

export const ContextProvider = ({ children }) => {
  const [revQueryObj, setRevQueryObj] = useState(null);
  const [revActiveTypesNFields, setRevActiveTypesNFields] = useState(null);
  const [revQueryType, setRevQueryType] = useState(null);
  const [revActiveRelationships, setRevActiveRelationships] = useState(null);
  const [revClickedField, setRevClickedField] = useState(null);
  const [formattedQuery, setFormattedQuery] = useState(null);
  const [reverseMode, setReverseMode] = useState(false);

  // console.log(`revQueryObj: `, revQueryObj);
  // console.log("revActiveTypesNFields:", revActiveTypesNFields);
  // console.log(`revActiveRelationships: `, revActiveRelationships);

  const revQueryObjUpdated = useRef(revQueryObj);

  const resetReverseContext = () => {
    setRevQueryObj(null);
    setRevClickedField(null);
    setRevActiveTypesNFields(null);
    setRevActiveRelationships(null);
    setFormattedQuery(null);
    setRevQueryType(null);
  };

  useEffect(() => {
    if (revQueryObj) {
      const { query } = gqlQB.query(revQueryObj);
      let fedQuery = query;

      if (revQueryType.includes(`mutation`)) {
        fedQuery = query.replace(`query`, `mutation`);
      }
      // console.log(`fedQuery IS: `, fedQuery);

      const formatted = formatReverseQuery(fedQuery);
      setFormattedQuery(formatted);
      console.log(`OUTPUT IS BELOW: `);
      console.log(formatted);
    }
    revQueryObjUpdated.current = revQueryObj;
  }, [revQueryObj]);

  useEffect(() => {
    if (revClickedField === null || !reverseMode) return;
    console.log("HERE");

    const { fieldName, typeName, relationship, args } = revClickedField;

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

      //if type node is not query or mutation, end operation
      if (
        !typeName.toLowerCase().includes(`query`) &&
        !typeName.toLowerCase().includes(`root`) &&
        !typeName.toLowerCase().includes(`mutation`)
      ) {
        console.log(`YA HAVE TO START WITH EITHER QUERY OR MUTATION`);
        return;
      }

      //create innitial query obj that graphql-query-builder will receive

      //consider first if field name takes arg. if so, just add to field name
      //args is an array containing all possible args as vals
      let field;
      if (args && args.length) {
        const length = args.length;
        let innerStr = ``;

        //in case of multiple args, iterate
        for (let i = 0; i < length; i++) {
          //only nonNull args should be added, the optional ones, not a priority and clutter up the reverse mode build query
          if (args[i].nonNull === true) {
            //first case essentially if there's another arg. If so, make sure the space is added at the end for proper formatting
            if (args[i + 1]) {
              innerStr += `<${args[i].name.toUpperCase()}> `;
            } else {
              //if no more args after current, just add arg name w/out space
              innerStr += `<${args[i].name.toUpperCase()}>`;
            }
          }
        }

        //adds parenthesis to vars innerString
        if (innerStr.length !== 0) {
          innerStr = `(${innerStr})`;
        }
        //adds inner string to field name.
        //TODO: This fieldName + vars String will create a BAD UX/UI when collisions occur and the field name w/ vars (only for query and mutations field) appears for the user to select. Gonna have to filter out the paranthesis and the chars within it, and then make sure if the user selects THAT field, field w/ vars, to resolve the collision, that the parenthesis and its contexts are present in the response too, since that field is actually saved as a reference w/ those vars, for convenience
        field = `${fieldName}${innerStr}`;
      } else {
        field = fieldName;
      }

      const revQueryRoot = [
        {
          operation: field,
          fields: [],
        },
      ];
      //Create Object#2
      //create map that will hold all active relationships between types and the fields that attach to them
      const revRelationships = new Map();
      // Query/root type always connects to others, but is never connected to. Empty array represents this
      revRelationships.set(typeName, []);
      // include selected type with relationship as key and value as array of the related fields. Note the
      //array holds nested objs for each field, including the field name and its corresponding type
      revRelationships.set(relationship, [{ field: field, type: typeName }]);

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
      //first thing: Get the correct starting operation
      //if user has clicked query again, the reference is going to be the overall array
      const revQueryRootName = [...revActiveRelationships.keys()][0];

      if (typeName === revQueryRootName) {
        //consider first if field name takes arg. if so, just add to field name
        //args is an array containing all possible args as vals
        let field;
        if (args && args.length) {
          const length = args.length;
          let innerStr = ``;

          //in case of multiple args, iterate
          for (let i = 0; i < length; i++) {
            //only nonNull args should be added, the optional ones, not a priority and clutter up the reverse mode build query
            if (args[i].nonNull === true) {
              //first case essentially if there's another arg. If so, make sure the space is added at the end for proper formatting
              if (args[i + 1]) {
                innerStr += `<${args[i].name.toUpperCase()}> `;
              } else {
                //if no more args after current, just add arg name w/out space
                innerStr += `<${args[i].name.toUpperCase()}>`;
              }
            }
          }

          //adds parenthesis to vars innerString
          if (innerStr.length !== 0) {
            innerStr = `(${innerStr})`;
          }
          //adds inner string to field name.
          //TODO: This fieldName + vars String will create a BAD UX/UI when collisions occur and the field name w/ vars (only for query and mutations field) appears for the user to select. Gonna have to filter out the paranthesis and the chars within it, and then make sure if the user selects THAT field, field w/ vars, to resolve the collision, that the parenthesis and its contexts are present in the response too, since that field is actually saved as a reference w/ those vars, for convenience
          field = `${fieldName}${innerStr}`;
        } else {
          field = fieldName;
        }

        const newOperation = {
          operation: field,
          fields: [],
        };
        revQueryObjUpdated.current.push(newOperation);
        //UPDATE STATE
        //update relationships
        setRevActiveRelationships((prevRevActiveRelations) => {
          //create a DEEP clone of the map. Otherwise, map properties will not update properly
          //since the values are all nested arrays/refs. Trust me.. I tried that lol.
          const updatedMap = new Map(
            JSON.parse(JSON.stringify(Array.from(prevRevActiveRelations)))
          );
          updatedMap.set(relationship, [{ field, type: typeName }]);
          return updatedMap;
        });

        //update rev active types n fields
        const curType = revActiveTypesNFields[typeName].slice();
        //push current field name into array copy
        curType.push(fieldName);
        setRevActiveTypesNFields((prevRevTypesNFields) => {
          //All fields in the Query type have a relationship. The below empty array represents the new "store" in which
          //future new fields belonging to that newly active obj type will be placed/stored in
          //Notice that curType is just a shallow copy (I don't think deep copy was necessary) of the previous entries for the current
          //obj type. It has been updated by pushing the current field into it
          return {
            ...prevRevTypesNFields,
            [typeName]: curType,
            [relationship]: [],
          };
        });

        //reassign query Obj
        setRevQueryObj([...revQueryObjUpdated.current]);
        //return to end operation
        return;
      }
      // else {
      //   //if user has clicked the type their first click was related to
      // }

      // if user clicked a non active field, user should be prompted: CHECKED AND PASSED

      // const [curOperation] = revActiveRelationships.get(typeName);
      // console.log(`curOperation IS: `, curOperation);

      //check if field has relationship
      if (relationship) {
        revQueryObjUpdated.current[0].fields.push({ [fieldName]: [] });
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
        revQueryObjUpdated.current[0].fields.push(fieldName);
      }

      //update reserve mode state

      //add to rev active types n fields
      //create a copy of the current fields of the current type. copy here intended to remove references so no funny behaviour happens down the line (hopefully)
      const curType = revActiveTypesNFields[typeName].slice();
      //push current field name into array copy
      curType.push(fieldName);
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
      setRevQueryObj([...revQueryObjUpdated.current]);
      //return to end operation
      return;
    }

    // STEP#3 THE BIGGGGG ONE!!!!
    //
    //
    //
    //
    //
    //In this step, we are keep track of the DEPTH of the fields property in the query obj.
    //Nested in here is where MOST of the fields will live.
    if (revActiveRelationships.size > 2) {
      // Getting the number of action relationships for that obType will help you determine if your click has led to a collision
      const numberOfActiveRelationships =
        revActiveRelationships.get(typeName).length;

      if (numberOfActiveRelationships > 1) {
        //******** WORK IN PROGRESS... DOING COLLISION MANAGEMENT HERE*******//
        //get info use to build user interface so they help us resolve a collision
        const rebuiltStr = revActiveRelationships
          .get(typeName)
          .reduce((acc, cur) => {
            const strForEachField = `  "${cur.field}" in ${cur.type}\n`;
            return acc + strForEachField;
          }, ``);

        //prompt the user
        const userClarification = prompt(
          `User has to click which relationship to follow!\nClick field "${fieldName}" can go into the following query fields:\n${rebuiltStr}Please choose one!`
        );

        // console.log(`userClarification`, userClarification);

        //receiving value from user, find the correct reference
        const [reference, isRevRoot, isOperation] = findCorrectReference(
          userClarification,
          revQueryObjUpdated,
          revActiveRelationships,
          revActiveTypesNFields
        );
        // console.log(`COLLISION reference IS: `, reference);
        // console.log(`COLLISION isRevRoot IS: `, isRevRoot);
        // console.log(`COLLISION isOperation IS: `, isOperation);

        //push user selected field (the prompt value) into the reference arr
        if (isRevRoot) {
          if (relationship) {
            //update active relationships

            reference.push({ [fieldName]: [] });
          } else {
            reference.push(fieldName);
          }
        } else {
          // console.log(`reference IS: `, reference);
          // console.log(`userClarification IS: `, userClarification);
          //handles scenario where in a collision, the field chosen has a relationship
          if (relationship && !isOperation) {
            reference[userClarification].push({ [fieldName]: [] });
            //handles scenario where in a collion, the chosen field is a scalar
          } else if (relationship && isOperation) {
            reference.fields.push({ [fieldName]: [] });
            //at this point, have handled all possible collisions where field names have relationships. Below is code handling the pushing into reference the field names of the collisions that are SCALARS
          } else if (!relationship && isOperation) {
            reference.fields.push(fieldName);
          } else {
            reference[userClarification].push(fieldName);
          }
        }

        // update reverse mode state
        //UPDATE THAT REVERSE MODE STATE

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
          } else if (mapValue && mapValue.length === 0) {
            updatedMap.set(relationship, [
              { field: fieldName, type: typeName },
            ]);
          }
          return updatedMap;
        });

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

        setRevQueryObj([...revQueryObjUpdated.current]);
        // console.log(`END OF THE ROAD HERE`);
        return;
        //******** WORK IN PROGRESS... DOING COLLISION MANAGEMENT HERE*******//
      }

      // Below in findCorrectReference func, we will recursively finding the reference/pointer
      //to the key that holds the corresponding array/field store. Once you have
      //that pointer/reference, you will be able to just push into it.
      // TO DO: Will need to fine tune this to ensure references are ALWAYS correct

      // get reference/pointer
      const [referenceObj] = revActiveRelationships.get(typeName);
      // console.log(`FIRST referenceObj IS: `, referenceObj);

      // in cases when reference of is undefined, bcz revActiveRelationships.get(typeName) gets an empty arr for empty relationships arrs, which only exists for query/mutation TO DO: MAKE SURE THIS WORKS FOR MUTATION
      const referenceStr = referenceObj?.field || typeName;
      // console.log(`FIRST referenceStr IS: `, referenceStr);

      if (relationship) {
        // console.log(`WHAT IS THE RELATIONSHIP?? `, relationship);
        //if clicked field does not have a relationship, reference will be null
        //since recursive funtion findCorrectReference did not find a relationship association to it, since it's a scalar
        const [reference, isRevRoot, isOperation] = findCorrectReference(
          referenceStr,
          revQueryObjUpdated,
          revActiveRelationships,
          revActiveTypesNFields
        );
        // console.log(`FIRST reference IS: `, reference);
        // console.log(`FIRST isRevRoot IS: `, isRevRoot);

        // if newly clicked field has refenrece, repeat the above idea where you create a new obj w/ field name as key
        //and values is an empty arr
        //add relationship to reverseActiveTypes

        //consider first if field name takes arg. if so, just add to field name
        //args is an array containing all possible args as vals
        let field;
        if (args && args.length) {
          const length = args.length;
          let innerStr = ``;

          //in case of multiple args, iterate
          for (let i = 0; i < length; i++) {
            //only nonNull args should be added, the optional ones, not a priority and clutter up the reverse mode build query
            if (args[i].nonNull === true) {
              //first case essentially if there's another arg. If so, make sure the space is added at the end for proper formatting
              if (args[i + 1]) {
                innerStr += `<${args[i].name.toUpperCase()}> `;
              } else {
                //if no more args after current, just add arg name w/out space
                innerStr += `<${args[i].name.toUpperCase()}>`;
              }
            }
          }

          //adds parenthesis to vars innerString
          if (innerStr.length !== 0) {
            innerStr = `(${innerStr})`;
          }
          //adds inner string to field name.
          //TODO: This fieldName + vars String will create a BAD UX/UI when collisions occur and the field name w/ vars (only for query and mutations field) appears for the user to select. Gonna have to filter out the paranthesis and the chars within it, and then make sure if the user selects THAT field, field w/ vars, to resolve the collision, that the parenthesis and its contexts are present in the response too, since that field is actually saved as a reference w/ those vars, for convenience
          field = `${fieldName}${innerStr}`;
        } else {
          field = fieldName;
        }

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
              field: field,
              type: typeName,
            });
          } else {
            updatedMap.set(relationship, [{ field: field, type: typeName }]);
          }

          return updatedMap;
        });

        //Since there was a relationship, recursive function found the reference in the
        // current query obj. Push into found reference

        //first check of special case if reference is operation. If so, push in there
        //operation's ref will be to the opening array of the revQueryObj arr. It's a particular case
        if (isRevRoot) {
          reference.push({ operation: field, fields: [] });
        } else if (isOperation) {
          reference.fields.push({ [fieldName]: [] });
        } else {
          reference[referenceStr] &&
            reference[referenceStr].push({ [fieldName]: [] });
        }
      } else {
        //No relationship, so, SCALAR! This conditional runs when all the active relationships (in the Map) are less than 2 (all of the actives will be 1, except for query, which has an empty array, so an array of 0). This is the case, for example of the user is just clicking on a bunch of scalars and barely any relationship fields.

        //Get current picture current/clicked field's objType relationship reference.
        //This will be an array
        const clickedFieldTypeRelationship =
          revActiveRelationships.get(typeName);

        //if the num (length) of the relationships is more than 1, have to promp further user input

        const [reference, isRevRoot, isOperation] = findCorrectReference(
          clickedFieldTypeRelationship[0].field,
          revQueryObjUpdated,
          revActiveRelationships,
          revActiveTypesNFields
        );
        // console.log(`SECOND reference IS: `, reference);
        // console.log(`SECOND isRevRoot IS: `, isRevRoot);
        // console.log(`SECOND isOperation IS: `, isOperation);

        //operation's ref will be to the opening array of the revQueryObj arr. It's a particular case
        if (isRevRoot) {
          reference.push(fieldName);
        } else if (isOperation) {
          reference.fields.push(fieldName);
        } else {
          //These references are found nested in the fields array, from the originally made revQueryRoot obj in Step#1
          reference[clickedFieldTypeRelationship[0].field].push(fieldName);
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
      setRevQueryObj([...revQueryObjUpdated.current]);
    }
  }, [revClickedField]);

  return (
    <ReverseContext.Provider
      value={{
        revQueryObj,
        setRevQueryObj,
        revClickedField,
        setRevClickedField,
        revActiveTypesNFields,
        setRevActiveTypesNFields,
        revActiveRelationships,
        setRevActiveRelationships,
        formattedQuery,
        setFormattedQuery,
        revQueryType,
        setRevQueryType,
        resetReverseContext,
        reverseMode,
        setReverseMode,
      }}
    >
      {children}
    </ReverseContext.Provider>
  );
};

export default ReverseContext;
