import { gql } from 'graphql-tag';

/* Create sets of active type ID's and active field ID's */
const getActivesFromQuery = (queryString, vSchema) => {
  const queryObj = gql`${queryString}`;
  console.log('queryObj: ', queryObj);
  console.log('vSchema: ', vSchema);

  // Array of Objects each representing an Object Type in the vSchema
  const vSchemaTypes = vSchema.objectTypes;

  const activeTypeIDs = new Set();
  const activeFieldIDs = new Set();

  // The particular name that corresponds to the Query/Root Type in the vSchema
  // (The name is arbitrary)
  const queryName = vSchema.queryName.name;
  // The actual Object Type in the vSchema which represents the Query/Root
  const queryType = vSchemaTypes.find(type => type.name === queryName);

  const query = queryObj.definitions[0];
  console.log('query: ', query);
  const gqlSelections = queryObj.definitions[0].selectionSet?.selections;
  const addActives = (vSchemaType, gqlSelection) => {
    activeTypeIDs.add(vSchemaType.name);
    activeFieldIDs.add(`${vSchemaType.name}/${gqlSelection.name.value}`);
    if (gqlSelection.selectionSet) {
      const vSchemaField = vSchemaType.fields.find(field => field.fieldName === gqlSelection.name.value);
      const vSchemaNextType = vSchemaTypes.find(type => type.name === vSchemaField.relationship);
      for (const selection of gqlSelection.selectionSet.selections) {
        // activeFieldIDs.add(`${vSchemaType.name}/${selection.name.value}`);
        addActives(vSchemaNextType, selection);
      }
    }
  }
  if (gqlSelections) {
    for (const gqlSelection of gqlSelections) {
      addActives(queryType, gqlSelection);
    }
  }
  return {
    activeTypeIDs,
    activeFieldIDs
  };
}


export default getActivesFromQuery;

