import React, { createContext, useState, useRef, useEffect } from "react";

import * as gqlQB from "gql-query-builder";
import formatReverseQuery from "../utils/formatReverseQuery";
import findCorrectReference from "../utils/findCorrectReference";

const ReverseContext = createContext({});

export const ContextProvider = ({ children }) => {
  const [revQueryObj, setRevQueryObj] = useState(null);
  const [revCurFields, setRevCurFields] = useState(null);
  const [revActiveTypesNFields, setRevActiveTypesNFields] = useState(null);
  const [revQueryType, setRevQueryType] = useState(null);
  const [revActiveRelationships, setRevActiveRelationships] = useState(null);
  const [revClickedField, setRevClickedField] = useState(null);
  const [formattedQuery, setFormattedQuery] = useState(null);
  const [reverseMode, setReverseMode] = useState(false);
  const [isCollision, setIsCollision] = useState(false);
  const [isRevModeError, setIsRevModeError] = useState(false);

  console.log(`revQueryObj: `, revQueryObj);
  console.log("revActiveTypesNFields:", revActiveTypesNFields);
  console.log(`revActiveRelationships: `, revActiveRelationships);
  console.log(`revCurFields: `, revCurFields);

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
    try {
      if (revClickedField === null || !reverseMode) return;
      console.log("HERE");

      const { fieldName, typeName, relationship, args } = revClickedField;

      // **************************************************************************************************************************************** //
      // ******************************************************** FIRST CLICK ******************************************************************* //
      // **************************************************************************************************************************************** //
      //If reverse mode state is null, Query/mutation field has not been click yet
      if (
        revQueryObjUpdated.current === null &&
        revActiveRelationships === null &&
        revActiveTypesNFields === null &&
        revQueryType === null
      ) {
        //if type node is not query or mutation, end operation
        if (
          !typeName.toLowerCase().includes(`query`) &&
          !typeName.toLowerCase().includes(`root`) &&
          !typeName.toLowerCase().includes(`mutation`)
        ) {
          console.log(`YA HAVE TO START WITH EITHER QUERY OR MUTATION`);
          return;
        }

        // Valid Click#1
        //create innitial query obj that graphql-query-builder will receive

        //consider first if field name takes arg. if so, the arg will simply be added to the field name
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

          //adds parenthesis to vars string
          if (innerStr.length !== 0) {
            innerStr = `(${innerStr})`;
          }
          //adds inner string to field name.
          field = `${fieldName}${innerStr}`;
        } else {
          field = fieldName;
        }

        //Create Object#1. This will correspond to revQueryObj. This will be the obj that will be fed to gql-query-builder (see package.json dependencies), which will then produce the desired gql query string. Notice operation value may or may not contain vars
        const revQueryRoot = [
          {
            operation: field,
            fields: [],
          },
        ];

        //Create Object#2
        //create map that will hold all active relationships between types and the fields that attach to them. This obj will correspond w/ revActiveTypesNFields
        const revRelationships = new Map();
        // Query/root and mutation types always connects to others, but are never connected to. Empty array represents this dynamic
        revRelationships.set(typeName, []);
        // Handle the selected type by making the relationship a key and its value and array with an obj of the field and its type. This will allow a lookup of the current fields and their types are related to a particular type node, eg "Question: What and how many fields are related to the "Continent" obj type? Answer: revActiveRelationships contains an array with 2 objs, one has a field value of "continents" and key of "Query", the other a field value of "continent" and key of "Country". From this, we know the "Continent" type has two relatinships, "continent/Query" and "continent/Country""
        //DO NOTE that after first click, 2 relationships will exist. This number of relationships will be userful to determine how to proceed in the reverse mode functionality
        revRelationships.set(relationship, [{ field: field, type: typeName }]);

        //Create Object#3
        //created obj to hold a record of all active types and fields/ This is dif than the above Object#2,
        //which catalogs the active RELATIONSHIPS, because this obj just stores all the types and their corresponding fields. This should be particularly useful to inform the visualizer which fields are active and thus need to be highlighted or modified in any way.
        const actives = {
          [typeName]: [fieldName],
          [relationship]: [],
        };

        //Create Object#4
        //This obj will keep an exact record of all of the fields that live within our revQueryObj. It does not care if the fields have a relationship, it's only storing the values/names of the fields themselves in an array belonging to that particular field. It is VERY important that they keys be given not just the name of the **field**, but also the name of the **type** the field belongs to, eg continents/Query. This obj will be useful for helping us sort through identical field names conflicts.
        const revCurFieldName = `${field}/${typeName}`;
        const revCurFieldsInit = {
          [revCurFieldName]: [],
        };

        // *************************************** //
        //***** UPDATE REVERSE MODE STATE ******/ //
        // *************************************** //

        //initialize reverse mode first active state
        setRevQueryObj(revQueryRoot);
        setRevCurFields(revCurFieldsInit);
        setRevActiveTypesNFields(actives);
        setRevActiveRelationships(revRelationships);
        setRevQueryType(typeName.toLowerCase());
        //return to end operation
        return;
      }

      // Above conditional was NOT met, meaning user has already clicked first valid click in reverse mode and assigned it some state.

      //Here a conditional check in important
      //A field's objectType has to exist in reverseActiveTypes in order to proceed
      // With the current implementation in Field.jsx (see reverseClickHandler func specifically the if/else statement),
      //perhaps the below condition check may be unnecessary. Still, doesn't hurt to have it here just to double
      //check that we're checking for only active types if we're going to be adding it to the query obj
      if (!revActiveRelationships.has(typeName)) return;

      // **************************************************************************************************************************************** //
      // ****************************************** OTHER CLICKS BEFORE 3 RELATIONSHIPS ********************************************************* //
      // **************************************************************************************************************************************** //
      // Valid Click#2 & other clicks before 3 relationships exist
      //If a user clicks a relationship field after their first reverse mode click, it will run here. After this 2nd click is handled, there will be 3 relationships and next conditional will be trigged, not this one. If a user clicks a scalar as the second click, however, notice that the number of active relationships remains the same. Until another relationship is clicked after first click, this condition will run.
      if (revActiveRelationships.size === 2) {
        //first thing: Get the correct starting reference. If this click occurs in the Query type, the reference to the query type needs to be specifically handled since it's unique (it's just the top layer array of revQueryObjUpdated). If the click occurs in the type that the first click allowed access to (eg. "continents/Continent"), the reference will be the "fields" value that exists in an object that also has the "operation: 'continents'" key/val pair.

        //if user has clicked query again, the reference is going to be the overall array
        // revQueryRootName grabs the name of the current starting operation; most cases this will be Query or Mutation
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
            field = `${fieldName}${innerStr}`;
          } else {
            // no args, so field can just be set to the fieldName (won't have any args)
            field = fieldName;
          }

          //Since root type was selected (Query/Mutation), a new operation obj needs to be created. This will be pushed in to the outter most array in the revQueryObjUpdated
          const newOperation = {
            operation: field,
            fields: [],
          };
          //push newly created operation into the root revQueryObj array, which is stored in the revQueryObjUpdated ref
          revQueryObjUpdated.current.push(newOperation);

          // *************************************** //
          //***** UPDATE REVERSE MODE STATE ******/ //
          // *************************************** //

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

          //update rev active types n fields. A copy is made to remove the ref to the array. Since no array/obj is a value in this obj, a deep clone is not necessary.
          const curType = revActiveTypesNFields[typeName].slice();
          //push current field name into array copy. This arr will replace its current counterpart when revActiveTypesNFields is updated
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

          //update revCurFields
          const revCurFieldName = `${field}/${typeName}`;
          setRevCurFields((prevRevCurFields) => {
            return {
              ...prevRevCurFields,
              [revCurFieldName]: [],
            };
          });

          //reassign query Obj
          setRevQueryObj([...revQueryObjUpdated.current]);
          //return to end operation
          return;
        }

        //If we reached here, user has clicked a field that is NOT in the Query/Mutation type

        //check if field has relationship. If so, needs to be handled differently than if a scalar field was selected
        if (relationship) {
          revQueryObjUpdated.current[0].fields.push({ [fieldName]: [] });
          //add field's relationship to reverseActiveTypes
          setRevActiveRelationships((prevRevActiveRelations) => {
            //create a DEEP clone of the map. Otherwise, map properties will not update properly
            //since the values are all nested arrays/refs.
            const updatedMap = new Map(
              JSON.parse(JSON.stringify(Array.from(prevRevActiveRelations)))
            );
            updatedMap.set(relationship, [
              { field: fieldName, type: typeName },
            ]);
            return updatedMap;
          });
        } else {
          //no relationship, just push into fields array that was created on valid Click#1/First Click
          revQueryObjUpdated.current[0].fields.push(fieldName);
        }

        // *************************************** //
        //***** UPDATE REVERSE MODE STATE ******/ //
        // *************************************** //

        //add to rev active types n fields
        //create a copy of the current fields of the current type. copy here intended to remove references so no funny behaviour happens down the line
        const curType = revActiveTypesNFields[typeName].slice();
        //push current field name into array copy
        curType.push(fieldName);
        setRevActiveTypesNFields((prevRevTypesNFields) => {
          if (relationship) {
            //if there was a relationship, empty array represents the new "store" in which
            //future new fields belonging to that newly active obj type will be placed/stored in
            return {
              ...prevRevTypesNFields,
              [typeName]: curType,
              [relationship]: [],
            };
          } else {
            //since no relationship exists, meaning a scalar val was clicked, no relationship key/val pair will be added in this case
            return {
              ...prevRevTypesNFields,
              [typeName]: curType,
            };
          }
        });

        //update revCurFields
        //get the name of the parent/root field. The parent/root field is the name of the field wherein the currently click field will live INSIDE OF in the revQueryObj, aka the build query. The information of this parent/root field is found in the revActiveRelationships obj. Notice these is found not just the field name of this parent/root field, but also its type.

        const { field, type } = revActiveRelationships.get(typeName)[0];
        const revCurFieldName = `${field}/${type}`;
        //need to grab the same array of the parent/root field in the revCurFields obj and push. Creating a copy of it to ensure reference is removed. Shallow copy deemed sufficient, since only strings go into this arr; no nested objs/arrays inside.
        const curFieldCopy = revCurFields[revCurFieldName].slice();
        //pushing cur field name to copy, and copy will become replace entry in revCurFields obj, thus updating entry w/ the new field.
        curFieldCopy.push(fieldName);

        setRevCurFields((prevRevCurFields) => {
          //Handle if clicked field has a relationship
          if (relationship) {
            const curFieldRelationshipName = `${fieldName}/${typeName}`;
            return {
              ...prevRevCurFields,
              [revCurFieldName]: curFieldCopy,
              [curFieldRelationshipName]: [],
            };
          } else {
            //since no relationship exists in this case, scalar was clicked, no relationship key/val pair will be added
            return {
              ...prevRevCurFields,
              [revCurFieldName]: curFieldCopy,
            };
          }
        });

        //reassign rev query Obj
        setRevQueryObj([...revQueryObjUpdated.current]);
        //return to end operation
        return;
      }

      // **************************************************************************************************************************************** //
      // *********************************************** 3 OR MORE RELATIONSHIPS *************************************************************** //
      // **************************************************************************************************************************************** //
      //In this step, we are using recursion to navigate through the DEPTH of the revQueryObjUpdated.current array.

      if (revActiveRelationships.size > 2) {
        // Getting the number of active relationships(determined by measing the length of that arr) for that obType will help determine if click has led to a collision, since if there is more than one active relationship for a type, this means a collision has occured
        const numberOfActiveRelationships =
          revActiveRelationships.get(typeName).length;

        //checking for collision
        if (numberOfActiveRelationships > 1) {
          setIsCollision(true);
          //******** COLLISION MANAGEMENT HERE*******//
          //BIG PICTURE: get info user to build user interface so they help us resolve a collision

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
          //creates vars for the field and its type that the user has selected. userClarifiedType will be used when updating the rev current fields below, when reverse mode state is being updated when handling a collision
          const [userClarifiedField, userClarifiedType] =
            userClarification.split(`/`);

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
              updatedMap.set(relationship, [
                { field: fieldName, type: typeName },
              ]);
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
        }

        //If we've reached here, we do NOT have a collision, so the active relationships to the type of the selected field is still just 1.
        // Below in findCorrectReference func, we will recursively find the reference/pointer
        //to the key that holds the corresponding array/field store. Once this ref has been obtained, it is possible to push the curerntly selected field into it.

        // get reference/pointer. This will be an array containing one obj inside. It will have the keys of "field" and "type" and their corresponding values
        const [referenceObj] = revActiveRelationships.get(typeName);

        // in cases when reference of is undefined, bcz revActiveRelationships.get(typeName) gets an empty arr for empty relationships arrs, which only exists for query/mutation TO DO: MAKE SURE THIS WORKS FOR MUTATION
        const referenceStr = referenceObj?.field || typeName;

        //if currently selected field has a relationship, the handling of the correct ref look up process will differ. Specifically, the only piece of state that needs to be updated in case of a relationship is setRevActiveRelationships.
        if (relationship) {
          //get root relationship to send into recursive func to allow a comparison of the cur field ref w/ it's current shape in state. This will be especially helpful to resolving identical field names conflict when they occur. The || "or operator" handles the case when the array is empty, thus meaning we've looked up the Query/Mutation type. In that case, just provide the field/type values of the selected field and type.
          //TO DO: BELOW LINE OF CODE MAY BE A REDUNDANCY
          const { field: rootField, type: rootType } =
            revActiveRelationships.get(typeName)[0] || {
              field: fieldName,
              type: typeName,
            };

          const rootRefString = `${rootField}/${rootType}`;
          // console.log(`RELATIONSHIP CURRENT rootRefString IS: `, rootRefString);

          const [reference, isRevRoot, isOperation] = findCorrectReference(
            referenceStr,
            revQueryObjUpdated,
            revActiveRelationships,
            revCurFields,
            rootRefString,
            fieldName
          );
          // console.log(`RELATIONSHIP reference IS: `, reference);
          // console.log(`RELATIONSHIP isRevRoot IS: `, isRevRoot);
          // console.log(`RELATIONSHIP isOperation IS: `, isOperation);

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
            field = `${fieldName}${innerStr}`;
          } else {
            field = fieldName;
          }

          //update rev active relationships
          setRevActiveRelationships((prevRevActiveRelations) => {
            const updatedMap = new Map(
              JSON.parse(JSON.stringify(Array.from(prevRevActiveRelations)))
            );
            const mapValue = updatedMap.get(relationship);

            // check if map at relationship already exists and has length
            //if so, push into resulting arr. This will make it so that when another field is clicked the has the same type relationship, if that array val has a length greater than 1, meaning more than one ref is assigned to it, a collision is occuring.
            if (mapValue && mapValue.length > 0) {
              mapValue.push({
                field: field,
                type: typeName,
              });
            } else {
              //if not, just create new map key/val pair, with key being the relationship and val and array w/ object w/ corresponding fields
              updatedMap.set(relationship, [{ field: field, type: typeName }]);
            }

            return updatedMap;
          });

          // update revQueryObjUpdated.current ref
          //first check of special case if reference is the outter most arr ref. If so, push in the
          //top lever arr of revQueryObjUpdated.curret. This is a particular case
          if (isRevRoot) {
            reference.push({ operation: field, fields: [] });
          } else if (isOperation) {
            reference.fields.push({ [fieldName]: [] });
          } else {
            reference[referenceStr] &&
              reference[referenceStr].push({ [fieldName]: [] });
          }

          //update rev current fields obj
          //first consider if isRevRoot scenario.
          if (isRevRoot) {
            const revCurFieldName = `${field}/${typeName}`;
            setRevCurFields((prevRevCurFields) => {
              return {
                ...prevRevCurFields,
                [revCurFieldName]: [],
              };
            });
          } else {
            const { field: rootField, type: rootType } =
              revActiveRelationships.get(typeName)[0];
            const revCurFieldName = `${rootField}/${rootType}`;

            //need to grab the same array of the parent/root field in the revCurFields obj and push
            const curFieldCopy = revCurFields[revCurFieldName].slice();
            curFieldCopy.push(fieldName);

            setRevCurFields((prevRevCurFields) => {
              const curFieldRelationshipName = `${fieldName}/${typeName}`;
              return {
                ...prevRevCurFields,
                [revCurFieldName]: curFieldCopy,
                [curFieldRelationshipName]: [],
              };
            });
          }
        } else {
          //Current num of relationships for this obj type is still just 1
          //Clicked field has no relationship, so, SCALAR! This conditional runs when all the active relationships (in the Map) are less than 2 (all of the actives will be 1, except for query, which has an empty array, so an array of 0)

          //Get current snapshot of the clicked field's objType relationship reference.
          //This will be an array w/ an obj. Deconstruct the obj to get necessary values
          const { field: rootField, type: rootType } =
            revActiveRelationships.get(typeName)[0];

          //this var will be used to access the current root ref's array entry in revCurFields obj.
          const rootRefString = `${rootField}/${rootType}`;

          const [reference, isRevRoot, isOperation] = findCorrectReference(
            rootField,
            revQueryObjUpdated,
            revActiveRelationships,
            revCurFields,
            rootRefString,
            fieldName
          );
          // console.log(`SCALAR reference IS: `, reference);
          // console.log(`SCALAR isRevRoot IS: `, isRevRoot);
          // console.log(`SCALAR isOperation IS: `, isOperation);

          //operation's ref will be to the opening array of the revQueryObj arr. It's a particular case
          if (isRevRoot) {
            reference.push(fieldName);
          } else if (isOperation) {
            reference.fields.push(fieldName);
          } else {
            //These references are found nested deeply in revQueryObjUpdate.current. This is the 3rd level kind of nested ref, that is, it isn't outter most/top level nor is it an operation nested array. It's an obj w/in one of the objs w/ the key name "operation" and the key "fields" with val of an array.
            reference[rootField].push(fieldName);
          }
        }

        // *************************************** //
        //***** UPDATE REVERSE MODE STATE ******/ //
        // *************************************** //

        //add to rev active types n fields
        const curType = revActiveTypesNFields[typeName].slice();
        curType.push(fieldName);

        //Use checkForDuplicate num to determine if a duplicate type will come up. Eg say Continent: [countries]
        //and Country: [emojie] already exists. If we then click State: [country],
        //Country already has an array (w/ 1 val of "emojie"), so the array needs only to be pushed into instead of overriden
        const checkForDuplicate =
          revActiveRelationships.get(relationship)?.length + 1;

        setRevActiveTypesNFields((prevRevTypesNFields) => {
          if (relationship) {
            if (checkForDuplicate > 1) {
              // to add the [relationship]: [] line on a duplicate would override the key/val pair, thus incorrectly assigning the value to an empty arr.
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

        //update rev current fields
        //updating of isRevRoot has already been done. Skip it here. Since isRevRoot is not defined in this scope block, get root name thru look up of its reference in the activesRelationship obj
        const revQueryRootName = [...revActiveRelationships.keys()][0];

        if (typeName !== revQueryRootName) {
          const { field: rootField, type: rootType } =
            revActiveRelationships.get(typeName)[0];
          const revCurFieldName = `${rootField}/${rootType}`;

          //need to grab the same array of the parent/root field in the revCurFields obj and push
          const curFieldCopy = revCurFields[revCurFieldName].slice();
          curFieldCopy.push(fieldName);

          setRevCurFields((prevRevCurFields) => {
            return {
              ...prevRevCurFields,
              [revCurFieldName]: curFieldCopy,
            };
          });
        }

        //update revQueryObj
        setRevQueryObj([...revQueryObjUpdated.current]);
      }
    } catch (error) {
      setIsRevModeError(true);
      console.error(error);
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
