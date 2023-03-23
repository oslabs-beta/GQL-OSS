import React, { useState, useEffect } from 'react';
import { request, gql } from 'graphql-request';
import { EndpointInput } from './components/EndpointInput';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

// backend endpoint: /api/

//graphql tests endpoint: http://localhost:4000/

const App = () => {
  // state
  const [endpoint, setEndpoint] = useState('https://swapi-graphql.netlify.app/.netlify/functions/index');

  const testGql = async () => {
    // test query for allFilms
    const data = await request(endpoint, query);
    console.log('allFilms query: ', data);

    // introspection query for schema
    // generate introspection query to retrieve schema
    const introspectionQuery = getIntrospectionQuery();
    const schema = await request(endpoint, introspectionQuery);
    console.log('introspection query: ', schema);

    // format schema for CodeMirror hint and lint
    const clientSchema = buildClientSchema(schema);
    console.log('clientSchema: ', clientSchema);

    // format schema in SDL (if needed?)
    const schemaSDL = printSchema(clientSchema);
    console.log('schemaSDL: ', schemaSDL);
  };

  return (
    <div>
      <h1>OSS: Our app</h1>
      <EndpointInput endpoint={endpoint} setEndpoint={setEndpoint}/>
      <button onClick={testGql}>Send gql request</button>
    </div>
  );
};

export default App;
