const findCorrectReference = (
  referenceStr,
  revQueryObjUpdated,
  revActiveRelationships,
  revActiveTypesNFields
) => {
  // console.log(`referenceStr IS: `, referenceStr);
  // console.log(`revQueryObj IS: `, revQueryObj);
  let correctTypeRef = null;
  let isRevRoot = false;
  let isOperation = false;
  let count = 0;

  const findCorrectTypeRecursive = (
    found = false,
    fields = revQueryObjUpdated.current
  ) => {
    // console.log(`COUNT: `, ++count);
    // console.log(`referenceStr: `, referenceStr);
    // console.log(`fields: `, fields);
    // console.log(`found: `, found);

    //check for special condition that a field belongs to the root fields
    //array created in Step#1 in revQueryRoot obj
    const revQueryRootName = [...revActiveRelationships.keys()][0];

    // console.log(`revQueryRootName HERE HERE: `, revQueryRootName);
    // console.log(`referenceStr HERE HERE: `, referenceStr);
    if (
      //IS THIS TO DO NECESSARY? TO DO: replace needed for when there's variables in the query/mutation
      revQueryRootName === referenceStr
    ) {
      // console.log(`RAN TUREEE`);
      correctTypeRef = fields;
      isRevRoot = true;
      found = true;
    }

    if (!found) {
      for (const field of fields) {
        // console.log(`field and referenceStr: `, field, referenceStr);
        // console.log(`TESTUBGL: `, field?.operation === referenceStr);

        //if the field has the exact correct string ref name BUUUUTTTT also find a way to check if it belong to the appropriate obj type
        //perhaps use a rebuilt string model of the current state of the array ref using JSON.stringify to see if the stringified version
        //of the current field matches the store stringified version of the current array field ref. Haven't designed yet a way for
        //storing/checking the stringified version of the query field. WORK ON THIS
        if (
          field.hasOwnProperty(referenceStr) ||
          field?.operation === referenceStr
        ) {
          // **** // FAILED ATTEMPT AT SOLVING THE DUPLICATE FIELD NAME PROBLEM
          //Createa a current snapshot of the objType state through stringifying it's values as store in the actives types n fields obj and comparing it with the current reference's current fields. Will have to iterate through the cur types to get its fields, saving them into an array, and in case of an obj, just store the key in the array. Then JSON.stringify it and compare it to the stringified version of it in active types n fields
          // console.log(`this is the FIELD`, field);
          // const stringifiedField = JSON.stringify(field);
          // console.log(`stringifiedField IS`, stringifiedField);
          // console.log(`revActiveTypesNFields for cur: `, revActiveTypesNFields);
          // **** // FAILED ATTEMPT AT SOLVING THE DUPLICATE FIELD NAME PROBLEM

          if (field?.operation === referenceStr) {
            isOperation = true;
          }

          // console.log(`MATCHED!`);
          correctTypeRef = field;
          found = true;
        } else {
          //recurse if field is an object, change fields arg to current field
          if (!Array.isArray(field) && typeof field === `object`) {
            // console.log(`AT LEAST THIS ONE WAS TRUE`);
            //find the key to pass down the recursive call with the field, which is an obj, but with the key, we access
            //its array value pair
            const keys = Object.keys(field);
            // console.log(`KEYS: `, keys);
            if (keys.includes(`operation`)) {
              //use key[1] fields
              // console.log(`WHY ARE YOU INFITE LOOPING? `, field[keys[1]]);
              findCorrectTypeRecursive(found, field[keys[1]]);
            } else {
              // This handles the 3rd case of, current field does not belong to the outter most array, nor to a field that immediately belongs to a referece that has an 'operation' key. Instead, it will have a key that belongs to the field that it's related to.
              //use key[0], this is going to be the key of the key/val pair pointing to the arr w/ the fields inside
              findCorrectTypeRecursive(found, field[keys[0]]);
            }
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

  return [correctTypeRef, isRevRoot, isOperation];
};

export default findCorrectReference;
