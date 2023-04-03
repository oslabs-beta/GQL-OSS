import React, { createContext, useState, useRef, useEffect } from "react";

import * as gqlQB from "gql-query-builder";
import formatReverseQuery from "../utils/formatReverseQuery";

const ReverseContext = createContext();

export const ContextProvider = ({ children }) => {
  const [revQueryObj, setRevQueryObj] = useState(null);
  const [revActiveTypesNFields, setRevActiveTypesNFields] = useState(null);
  const [revQueryType, setRevQueryType] = useState(null);
  const [revActiveRelationships, setRevActiveRelationships] = useState(null);
  const [revClickedField, setRevClickedField] = useState(null);
  const [dummyState, setDummyState] = useState(false);

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
  }, [dummyState]);

  useEffect(() => {
    revQueryObjUpdated.current = revQueryObj;
  }, [revQueryObj]);

  useEffect(() => {
    if (revClickedField === null) return;
    setDummyState((prev) => !prev);

    const { fieldName, typeName, relationship } = revClickedField;

    if (
      revQueryObjUpdated.current === null &&
      revActiveRelationships === null &&
      revActiveTypesNFields === null &&
      revQueryType === null
    ) {
      // for first click, create innitial obj share that graphql-query-builder receives
      const revQueryRoot = {
        operation: fieldName,
        fields: [],
      };
      //create map that will hold all active relationships between types and the fields that attach to them
      const revRelationships = new Map();
      // Query/root type always connects to others, but is never connected to. Empty array represents this
      revRelationships.set(typeName, []);
      // include selected type with relationship as key and value as array of the related fields. Note the
      //array holds nested objs for each field, including the field name and its corresponding type
      revRelationships.set(relationship, [
        { field: fieldName, type: typeName },
      ]);

      //created obj to hold a record of all active types and fields
      let actives;
      if (!relationship) {
        actives = {
          [typeName]: [fieldName],
        };
      } else {
        actives = {
          [typeName]: [fieldName],
          [relationship]: [],
        };
      }

      //initialize reverse mode first active state
      setRevQueryObj(revQueryRoot);
      setRevActiveTypesNFields(actives);
      relationship && setRevActiveRelationships(revRelationships);
      setRevQueryType(typeName.toLowerCase());
      return;
    }
    // else the reverse query has already begun, so you just need to add the appropriate fields and shit into their place
    // a field's objectType has to exist in reverseActiveTypes in order to proceed
    // console.log(reverseActiveTypes.has(typeName));
    if (!revActiveRelationships.has(typeName)) return;

    //First field(s) after rev mode init and picking query or mutation is easy.
    //just push into the fields array
    if (revActiveRelationships.size === 2) {
      //add to rev active types n fields
      const curType = revActiveTypesNFields[typeName].slice();
      curType.push(fieldName);

      //check if field has relationship
      if (relationship) {
        const arrayRef = [];
        revQueryObjUpdated.current.fields.push({ [fieldName]: arrayRef });
        //add relationship to reverseActiveTypes
        setRevActiveRelationships((prevRevActiveRelations) => {
          //create a DEEP clone of the map. Otherwise, map properties will not update properly
          //since the values are all nested arrays/refs
          const updatedMap = new Map(
            JSON.parse(JSON.stringify(Array.from(prevRevActiveRelations)))
          );
          updatedMap.set(relationship, [
            { field: fieldName, type: typeName, reference: arrayRef },
          ]);
          return updatedMap;
        });
      } else {
        //a no relationship field, ie ends in scalar
        revQueryObjUpdated.current.fields.push(fieldName);
      }
      //update reserve mode state
      setRevActiveTypesNFields((prevRevTypesNFields) => {
        if (relationship) {
          return {
            ...prevRevTypesNFields,
            [typeName]: curType,
            [relationship]: [],
          };
        } else {
          return {
            ...prevRevTypesNFields,
            [typeName]: curType,
          };
        }
      });
      setRevQueryObj(revQueryObjUpdated.current);
    }

    // INTO THE MEAT OF IT
    if (revActiveRelationships.size > 2) {
      const numberOfActiveRelationships =
        revActiveRelationships.get(typeName).length;
      if (numberOfActiveRelationships > 1) {
        alert(`User has to click which relationship to follow!`);
      }

      // need to recursively? find the reference/pointer to the key that holds the corresponding array/field store. Once you have
      //that pointer/reference, you SHOULD be able to just push into it.
      // TO DO: Will need to fine tune this to ensure references are ALWAYS correct

      // get reference/pointer
      const [referenceObj] = revActiveRelationships.get(typeName);
      // console.log(`referenceObj: `, referenceObj);
      const referenceStr = referenceObj.field;
      const findCorrectReference = () => {
        let correctTypeRef = null;

        const findCorrectTypeRecursive = (
          found = false,
          fields = revQueryObjUpdated.current.fields
        ) => {
          // console.log(`referenceStr: `, referenceStr);
          // console.log(`fields: `, fields);
          // console.log(`found: `, found);
          if (!found) {
            for (const field of fields) {
              // console.log(`field: `, field);
              if (field.hasOwnProperty(referenceStr)) {
                // console.log(`MATCHED!`);
                correctTypeRef = field;
                found = true;
              } else {
                //recurse if field is an object, change fields arg to current field
                if (!Array.isArray(field) && typeof field === `object`) {
                  //find the key to pass down the recursive call with the field, which is an obj, but with the key, we access
                  //its array value pair
                  const [key] = Object.keys(field);
                  findCorrectTypeRecursive(found, field[key]);
                }
              }
            }
          }
          // console.log(`correctTypeRef: `, correctTypeRef);
          // not sure we ever reach here in the code
          // case if is not found?
          // console.log(`reference type was NOT found`);
          return;
        };
        findCorrectTypeRecursive();

        return correctTypeRef;
      };
      const reference = findCorrectReference(typeName);
      // console.log(`reference: `, reference);
      // console.log(`referenseStr: `, referenceStr);
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
            mapValue.push({ field: fieldName, type: typeName });
          } else {
            updatedMap.set(relationship, [
              { field: fieldName, type: typeName },
            ]);
          }

          return updatedMap;
        });
        reference[referenceStr].push({ [fieldName]: [] });
      } else {
        reference[referenceStr].push(fieldName);
      }

      //UPDATE THAT REVERSE MODE STATE
      //add to rev active types n fields
      const curType = revActiveTypesNFields[typeName].slice();
      curType.push(fieldName);

      //Use this num to determine if a duplicate type will come up
      //if so, need to not override the former type by recreating it w/ an empty arr
      const checkForDuplicate =
        revActiveRelationships.get(relationship)?.length + 1;

      setRevActiveTypesNFields((prevRevTypesNFields) => {
        if (relationship) {
          console.log(`relationship: `, relationship);
          console.log(
            `IMP LENGTH: `,
            revActiveRelationships.get(relationship)?.length + 1
          );

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
      setRevQueryObj(revQueryObjUpdated.current);
    }

    /*
    graphql-query-builder query string example:
    const DUMMY_OBJ = {
      operation: "continents",
      fields: [
        "code",
        "name",
        { countries: [`code`, `name`, { languages: [`name`, `native`] }] },
      ],
    };
    const { query } = gqlQB.query(DUMMY_OBJ);
    console.log(query); /-> query  { continents  { code, name, countries { code, name, languages { name, native } } } }
    */
  }, [revClickedField]);

  return (
    <ReverseContext.Provider
      value={{
        revQueryObj,
        setRevQueryObj,
        setRevClickedField,
        revActiveTypesNFields,
        revActiveRelationships,
        setDummyState,
      }}
    >
      {children}
    </ReverseContext.Provider>
  );
};

export default ReverseContext;
