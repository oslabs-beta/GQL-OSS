const findCorrectReference = (
  referenceStr,
  revQueryObjUpdated,
  revActiveRelationships,
  revCurFields,
  rootRefString,
  selectedField
) => {
  let correctTypeRef = null;
  let isRevRoot = false;
  let isOperation = false;
  // console.log(`CURRENT referenceStr IS: `, referenceStr);
  // console.log(`CURRENT rootRefString IS: `, rootRefString);
  // console.log(`CURRENT selectedField IS: `, selectedField);

  //Grabs the query/mutation name. Will be useful in checking if the passed in reference string belongs to the outter most/top layer array of the revQueryObjUpdated.current
  const revQueryRootName = [...revActiveRelationships.keys()][0];

  const findCorrectTypeRecursive = (
    found = false,
    fields = revQueryObjUpdated.current
  ) => {
    // console.log(`CURRENT found IS: `, found);
    // console.log(`CURRENT fields IS: `, fields);

    //check for special condition that a field belongs to the root fields
    //outter most/ top level array created in Step#1 in revQueryRoot obj
    if (
      //IS THIS TO DO NECESSARY, I DONT THINK SO BUT DOUBLE CHECK? TO DO: replace needed for when there's variables in the query/mutation
      revQueryRootName === referenceStr
    ) {
      correctTypeRef = fields;
      isRevRoot = true;
      found = true;
    }

    if (!found) {
      for (const field of fields) {
        //if the field has the exact correct string ref name BUT also find a way to check if it belong to the appropriate obj type
        //perhaps use a rebuilt string model of the current state of the array ref using JSON.stringify to see if the stringified version
        //of the current field matches the store stringified version of the current array field ref. Haven't designed yet a way for
        //storing/checking the stringified version of the query field. WORK ON THIS
        if (
          field.hasOwnProperty(referenceStr) ||
          field?.operation === referenceStr
        ) {
          //Createa a current snapshot of the objType state through stringifying it's values as store in the actives types n fields obj and comparing it with the current reference's current fields. Will have to iterate through the cur types to get its fields, saving them into an array, and in case of an obj, just store the key in the array. Then JSON.stringify it and compare it to the stringified version of it in active types n fields

          //check if current field is an opperation level field. if so, change the necesssary references for the recreated copies. This change is only necessary for the copies. The field reference itself needs to be passed on to the correcTypeRef if there was a match.

          let recreatedCurField;

          if (!field.hasOwnProperty(`operation`)) {
            //first recreate the current field root, this is the array where the currently selected field will be pushed into if it passes the checks
            recreatedCurField = field[referenceStr].map((el) => {
              if (!Array.isArray(el) && typeof el === `object`) {
                //handle that cur field value is an object
                const [key] = Object.keys(el);
                return key;
              } else {
                return el;
              }
            });
          } else {
            recreatedCurField = field.fields.map((el) => {
              if (!Array.isArray(el) && typeof el === `object`) {
                //handle that cur field value is an object
                const [key] = Object.keys(el);
                return key;
              } else {
                return el;
              }
            });
          }

          //second, recreate the current snapshot of the exact field/type reference, as stored in state in the obj revCurFields
          const recreatedRootSnapshot = revCurFields[rootRefString].slice();

          //Now convert these copies into their own JSON.stringigy string, and check if they are equal.
          const stringifiedCurField = JSON.stringify(recreatedCurField);
          const stringifiedRootSnapshot = JSON.stringify(recreatedRootSnapshot);
          // console.log(
          //   `CURRENT stringifiedCurField, stringifiedRootSnapshot IS: `,
          //   stringifiedCurField,
          //   stringifiedRootSnapshot
          // );

          //if both of the strings are equal, it is HIGHLY PROBABLY that the matched reference is for the intended field/type relationship. This check helps us overcome conflicts when fields w/ identical names are in use, since identical names does not mean identical values. Since the revCurFields keeps a record of all the fields, their relationship to its type, and its values, a comparison allows this check.
          if (stringifiedCurField === stringifiedRootSnapshot) {
            if (field?.operation === referenceStr) {
              isOperation = true;
            }
            // console.log(`DID WE MAKE IT IN HERE?`);
            correctTypeRef = field;
            found = true;
          }
        } else {
          //recurse if field is an object, change fields arg to current field
          if (!Array.isArray(field) && typeof field === `object`) {
            //find the key to pass down the recursive call with the field, which is an obj, but with the key, we access
            //its array value pair
            const keys = Object.keys(field);

            if (keys.includes(`operation`)) {
              //use key[1] fields

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
    // not sure we ever reach here in the code
    return;
  };
  findCorrectTypeRecursive();

  return [correctTypeRef, isRevRoot, isOperation];
};

export default findCorrectReference;
