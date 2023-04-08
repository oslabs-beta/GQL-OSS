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

  console.log(`revQueryObj: `, revQueryObj);
  console.log("revActiveTypesNFields:", revActiveTypesNFields);
  console.log(`revActiveRelationships: `, revActiveRelationships);
  console.log(`revCurFields: `, revCurFields);

  const revQueryObjUpdated = useRef(revQueryObj);

  useEffect(() => {
    if (revQueryObj) {
      const { query } = gqlQB.query(revQueryObj);
      let fedQuery = query;

      if (revQueryType.includes(`mutation`)) {
        fedQuery = query.replace(`query`, `mutation`);
      }
      // console.log(`fedQuery IS: `, fedQuery);

      const formatted = formatReverseQuery(fedQuery);
      console.log(`OUTPUT IS BELOW: `);
      console.log(formatted);
    }
    revQueryObjUpdated.current = revQueryObj;
  }, [revQueryObj]);

  useEffect(() => {
    if (revClickedField === null) return;

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

      //Create Object#4
      //This obj will keep an exact record of all of the fields that live within our revQueryObj. It does not care if the fields have a relationship, it's only storing the values/names of the fields themselves in an array belonging to that particular field. It is VERY important that they keys be given not just the name of the field, but also the name of the type the field belongs to, eg continents/Query. This obj SHOULD be useful for helping us sort through identical field names conflicts.
      const revCurFieldName = `${field}/${typeName}`;
      const revCurFieldsInit = {
        [revCurFieldName]: [],
      };

      //initialize reverse mode first active state
      setRevQueryObj(revQueryRoot);
      //ADD TO HERE
      setRevCurFields(revCurFieldsInit);
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
          // no args, so field can just be set to the fieldName (won't have any args)
          field = fieldName;
        }

        const newOperation = {
          operation: field,
          fields: [],
        };
        //push newly created operation into the root revQueryObj array, which is stored in the revQueryObjUpdated ref
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

      //If we reached here, user has clicked the type that is NOT in Query type
      // if user clicked a non active field, user should be prompted: CHECKED AND PASSED

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

      //update revCurFields
      //get the name of the parent/root field

      // console.log(`CURRENT typeName IS: `, typeName);
      // console.log(
      //   `CURRENT revActiveRelationships.get(typeName) IS: `,
      //   revActiveRelationships.get(typeName)
      // );
      const { field, type } = revActiveRelationships.get(typeName)[0];
      const revCurFieldName = `${field}/${type}`;
      //need to grab the same array of the parent/root field in the revCurFields obj and push
      const curFieldCopy = revCurFields[revCurFieldName].slice();
      curFieldCopy.push(fieldName);

      // console.log(`CURRENT curFieldCopy IS`, curFieldCopy);

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

      //reassign rev query Obj
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
        const [userClarifiedField, userClarifiedType] =
          userClarification.split(`/`);
        console.log(`CURRENT userClarifiedField IS`, userClarification);
        // console.log(`CURRENT userClarifiedType IS`, userClarifiedType);

        // const rootRelationship = revActiveRelationships.get(typeName);
        // console.log(`CURRENT rootRelationship IS: `, rootRelationship);

        //receiving value from user, find the correct reference
        const [reference, isRevRoot, isOperation] = findCorrectReference(
          userClarifiedField,
          revQueryObjUpdated,
          revActiveRelationships,
          revCurFields,
          userClarification,
          fieldName
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
            reference[userClarifiedField].push({ [fieldName]: [] });
            //handles scenario where in a collion, the chosen field is a scalar
          } else if (relationship && isOperation) {
            reference.fields.push({ [fieldName]: [] });
            //at this point, have handled all possible collisions where field names have relationships. Below is code handling the pushing into reference the field names of the collisions that are SCALARS
          } else if (!relationship && isOperation) {
            reference.fields.push(fieldName);
          } else {
            reference[userClarifiedField].push(fieldName);
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
          // console.log(`mapValue IS: `, mapValue);
          //if so, push into it
          //if not, just create new map key/val pair, with key being the relationship and val and array w/ object w/ corresponding fields
          if (mapValue && mapValue.length > 0) {
            mapValue.push({
              field: fieldName,
              type: typeName,
            });
          } else if ((mapValue && mapValue.length === 0) || !mapValue) {
            updatedMap.set(relationship, [
              { field: fieldName, type: typeName },
            ]);
          }
          // else if (!mapValue) {
          //   updatedMap.set(relationship, []);
          // }
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

        //update rev current fields
        // console.log(`STUDY THIS HERE: `, revActiveRelationships);
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
        // console.log(`CURRENT rootField & rootType IS`, rootField, rootType);
        const revCurFieldName = `${rootField}/${rootType}`;
        // console.log(`CURRENT revCurFieldName IS`, revCurFieldName);

        //need to grab the same array of the parent/root field in the revCurFields obj and push
        const curFieldCopy = revCurFields[revCurFieldName].slice();
        curFieldCopy.push(fieldName);
        // console.log(`CURRENT curFieldCopy IS`, curFieldCopy);

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
        //get root relationship to send into recursive func to allow a comparison of the cur field ref w/ it's current shape in state. This will be especially helpful to resolving identical field names conflict when they occur
        const { field: rootField, type: rootType } = revActiveRelationships.get(
          typeName
        )[0] || { field: fieldName, type: typeName };

        const rootRefString = `${rootField}/${rootType}`;
        console.log(`FIRST CURRENT rootRefString IS: `, rootRefString);

        //since recursive funtion findCorrectReference did not find a relationship association to it, since it's a scalar

        const [reference, isRevRoot, isOperation] = findCorrectReference(
          referenceStr,
          revQueryObjUpdated,
          revActiveRelationships,
          revCurFields,
          rootRefString,
          fieldName
        );
        console.log(`FIRST reference IS: `, reference);
        console.log(`FIRST isRevRoot IS: `, isRevRoot);
        console.log(`FIRST isOperation IS: `, isOperation);

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

        //update rev active relationships
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

        //update rev current fields
        //first consider if isRevRoot scenario. Account also for variables
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
          // console.log(`CURRENT rootField & rootType IS`, rootField, rootType);
          // console.log(`CURRENT curFieldCopy IS`, revCurFieldName);

          //need to grab the same array of the parent/root field in the revCurFields obj and push
          const curFieldCopy = revCurFields[revCurFieldName].slice();
          curFieldCopy.push(fieldName);
          // console.log(`CURRENT curFieldCopy IS`, curFieldCopy);

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
        //No relationship, so, SCALAR! This conditional runs when all the active relationships (in the Map) are less than 2 (all of the actives will be 1, except for query, which has an empty array, so an array of 0). This is the case, for example of the user is just clicking on a bunch of scalars and barely any relationship fields.

        //Get current picture current/clicked field's objType relationship reference.
        //This will be an array w/ an obj. Deconstruct the obj to get necessary values
        const { field: rootField, type: rootType } =
          revActiveRelationships.get(typeName)[0];

        const rootRefString = `${rootField}/${rootType}`;

        console.log(`SECOND CURRENT rootRefString IS: `, rootRefString);

        const [reference, isRevRoot, isOperation] = findCorrectReference(
          rootField,
          revQueryObjUpdated,
          revActiveRelationships,
          revCurFields,
          rootRefString,
          fieldName
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
          reference[rootField].push(fieldName);
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

      //update rev current fields
      //updating of isRevRoot has already been done. Skip it here. Since isRevRoot is not defined in this scope, get root name thru look up of its reference in the activesRelationship obj
      const revQueryRootName = [...revActiveRelationships.keys()][0];

      if (typeName !== revQueryRootName) {
        const { field: rootField, type: rootType } =
          revActiveRelationships.get(typeName)[0];
        const revCurFieldName = `${rootField}/${rootType}`;
        // console.log(`CURRENT rootField & rootType IS`, rootField, rootType);
        // console.log(`CURRENT curFieldCopy IS`, revCurFieldName);

        //need to grab the same array of the parent/root field in the revCurFields obj and push
        const curFieldCopy = revCurFields[revCurFieldName].slice();
        curFieldCopy.push(fieldName);
        // console.log(`CURRENT curFieldCopy IS`, curFieldCopy);

        setRevCurFields((prevRevCurFields) => {
          // const curFieldRelationshipName = `${fieldName}/${typeName}`;
          return {
            ...prevRevCurFields,
            [revCurFieldName]: curFieldCopy,
            // [curFieldRelationshipName]: [],
          };
        });
      }

      //update revQueryObj
      setRevQueryObj([...revQueryObjUpdated.current]);
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
