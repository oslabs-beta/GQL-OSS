import React, { useState, useEffect } from 'react';
import { request, gql } from 'graphql-request';
import { EndpointInput } from './components/EndpointInput';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';
import Editor from './Editor';
import Visualizer from './components/Visualizer';

import parseReceivedSchema from './funcs/parseIntrospectionQueryResponse';

// backend endpoint: /api/

//graphql tests endpoint: http://localhost:4000/

const App = () => {
  // state
  const [endpoint, setEndpoint] = useState(
    'https://countries.trevorblades.com/'
  );
  const [schema, setSchema] = useState(null);
  const [vSchema, setVSchema] = useState(null);

  const fetchSchema = async () => {
    // introspection query to get schema
    const schema = await request(endpoint, getIntrospectionQuery());
    setSchema(schema);
    const parsedSchemaData = parseReceivedSchema(schema);
    setVSchema(parsedSchemaData.visualizerSchema);

    // format schema for CodeMirror hint and lint
    // const clientSchema = buildClientSchema(schema);
    // console.log('clientSchema: ', clientSchema);

    // format schema in SDL (if needed?)
    // const schemaSDL = printSchema(clientSchema);
    // console.log('schemaSDL: ', schemaSDL);
  };
  console.log('schema is: ', schema);
  console.log('vSchema is: ', vSchema);

  return (
    <main>
      <Editor schema={schema} endpoint={endpoint}></Editor>
      <section className="endpoint-section">
        <EndpointInput endpoint={endpoint} setEndpoint={setEndpoint} />
        <button onClick={fetchSchema}>Fetch Schema</button>
        <Visualizer vSchema={vSchema}></Visualizer>
      </section>
    </main>
  );
};

export default App;
