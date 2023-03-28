import { gql } from 'graphql-tag';

/* Create sets of active type ID's and active field ID's */
const getActivesFromQuery = (queryString, vSchema) => {
  if (queryString === '' || null) return {activeFieldIDs: null, activeTypeIDs: null};

  const queryObj = gql`${queryString}`;
  // console.log('queryObj: ', queryObj);
  // console.log('vSchema: ', vSchema);

  // Array of Objects each representing an Object Type in the vSchema
  const vSchemaTypes = vSchema.objectTypes;

  const activeTypeIDs = new Set();
  const activeFieldIDs = new Set();
  const activeEdgeIDs = new Set();

  // The particular name that corresponds to the Query/Root Type in the vSchema
  // (The name is arbitrary)
  const queryName = vSchema.queryName.name;
  // The actual Object Type in the vSchema which represents the Query/Root
  const queryType = vSchemaTypes.find(type => type.name === queryName);
  const gqlSelections = queryObj.definitions[0].selectionSet?.selections;

  // Recursive helper function to parse the selections of the query object and add the corresponding ID's
  const addActives = (vSchemaType, gqlSelection) => {
    activeTypeIDs.add(vSchemaType.name);
    activeFieldIDs.add(`${vSchemaType.name}/${gqlSelection.name.value}`);
    if (gqlSelection.selectionSet) {
      const vSchemaField = vSchemaType.fields.find(field => field.fieldName === gqlSelection.name.value);
      const vSchemaNextType = vSchemaTypes.find(type => type.name === vSchemaField.relationship);
      activeEdgeIDs.add(`${vSchemaType.name}/${gqlSelection.name.value}-${vSchemaNextType.name}`);
      for (const selection of gqlSelection.selectionSet.selections) {
        addActives(vSchemaNextType, selection);
      }
    }
  }
  // Starting from the top (at the Query/Root Type)
  if (gqlSelections) {
    for (const gqlSelection of gqlSelections) {
      addActives(queryType, gqlSelection);
    }
  }
  return {
    activeTypeIDs,
    activeFieldIDs,
    activeEdgeIDs
  };
}


export default getActivesFromQuery;

