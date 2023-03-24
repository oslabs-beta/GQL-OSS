import React, { useState, useEffect } from 'react';
import { request, gql } from 'graphql-request';
import { EndpointInput } from './components/EndpointInput';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';
import Editor from './Editor';
import Visualizer from './components/Visualizer';

// backend endpoint: /api/

//graphql tests endpoint: http://localhost:4000/

const App = () => {
  // state
  const [endpoint, setEndpoint] = useState('https://swapi-graphql.netlify.app/.netlify/functions/index');
  const [schema, setSchema] = useState(null);

  const fetchSchema = async () => {
    // introspection query to get schema
    const schema = await request(endpoint, getIntrospectionQuery());
    console.log('schema: ', schema);
    setSchema(schema);

    // format schema for CodeMirror hint and lint
    // const clientSchema = buildClientSchema(schema);
    // console.log('clientSchema: ', clientSchema);

    // format schema in SDL (if needed?)
    // const schemaSDL = printSchema(clientSchema);
    // console.log('schemaSDL: ', schemaSDL);
  };

  return (
    <main>
      <Editor schema={schema} endpoint={endpoint}></Editor>
      <section className="endpoint-section">
        <EndpointInput endpoint={endpoint} setEndpoint={setEndpoint}/>
        <button onClick={fetchSchema}>Fetch Schema</button>
        <Visualizer></Visualizer>
      </section>
    </main>
  );
};

export default App;
