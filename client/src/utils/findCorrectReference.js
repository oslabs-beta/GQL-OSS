const findCorrectReference = (
  referenceStr,
  revQueryObjUpdated,
  revActiveRelationships,
  revCurFields,
  rootRefString,
  selectedField
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
    console.log(`referenceStr: `, referenceStr);
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
          // console.log(`CURRENT referenceStr IS: `, referenceStr);
          console.log(`CURRENT this is the FIELD`, field);

          //check if current field is an opperation level field. if so, change the necesssary references for the recreated copies. This change is only necessary for the copies. The field reference itself needs to be passed on to the correcTypeRef if there was a match.
          ///DOOO IT HERE!!

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
          console.log(`CURRENT recreatedCurField for cur: `, recreatedCurField);
          console.log(
            `CURRENT recreatedFieldSnapshot for cur: `,
            recreatedRootSnapshot
          );

          //Now convert these copies into their own JSON.stringigy string, and check if they are equal.
          const stringifiedCurField = JSON.stringify(recreatedCurField);
          const stringifiedRootSnapshot = JSON.stringify(recreatedCurField);

          //if both of the strings are equal, it is HIGHLY PROBABLY that the matched reference is for the intended field/type relationship. This check helps us overcome conflicts when fields w/ identical names are in use, since identical names does not mean identical values. Since the revCurFields keeps a record of all the fields, their relationship to its type, and its values, a comparison allows this check.
          if (stringifiedCurField === stringifiedRootSnapshot) {
            if (field?.operation === referenceStr) {
              isOperation = true;
            }
            console.log(`MATCHED!`);
            correctTypeRef = field;
            found = true;
          }
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
