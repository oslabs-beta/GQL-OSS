const findCorrectReference = (
  referenceStr,
  revQueryObjUpdated,
  revQueryObj
) => {
  console.log(`referenceStr IS: `, referenceStr);
  // console.log(`revQueryObj IS: `, revQueryObj);
  let correctTypeRef = null;
  let isOperation = false;

  const findCorrectTypeRecursive = (
    found = false,
    fields = revQueryObjUpdated.current.fields
  ) => {
    console.log(`referenceStr: `, referenceStr);
    console.log(`fields: `, fields);
    // console.log(`found: `, found);

    //check for special condition that a field belongs to the root fields
    //array created in Step#1 in revQueryRoot obj
    if (
      //replace needed for when there's variables in the query/mutation
      revQueryObj.operation === referenceStr
    ) {
      console.log(`FOUND FOUND FOUND`);
      correctTypeRef = fields;
      isOperation = true;
      found = true;
    }

    if (!found) {
      for (const field of fields) {
        // console.log(`field: `, field);
        //if the field has the exact correct string ref name BUUUUTTTT also find a way to check if it belong to the appropriate obj type
        //perhaps use a rebuilt string model of the current state of the array ref using JSON.stringify to see if the stringified version
        //of the current field matches the store stringified version of the current array field ref. Haven't designed yet a way for
        //storing/checking the stringified version of the query field. WORK ON THIS
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

  return [correctTypeRef, isOperation];
};

export default findCorrectReference;
