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
    // console.log(`referenceStr: `, referenceStr);
    // console.log(`fields: `, fields);
    // console.log(`found: `, found);

    if (revQueryObj.operation === referenceStr) {
      console.log(`FOUND FOUND FOUND`);
      correctTypeRef = fields;
      isOperation = true;
      found = true;
    }

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

  return [correctTypeRef, isOperation];
};

export default findCorrectReference;
