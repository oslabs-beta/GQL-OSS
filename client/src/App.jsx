import React, { useState, useEffect } from 'react';
import { request, gql } from 'graphql-request';
import { buildClientSchema, printSchema, getIntrospectionQuery} from 'graphql';

// backend endpoint: /api/

//graphql tests endpoint: http://localhost:4000/

const App = () => {
  const [endpoint, setEndpoint] = useState(null);
  // refactor this to grab url from user input
  useEffect(() => {
    setEndpoint('https://swapi-graphql.netlify.app/.netlify/functions/index');
  }, []);

  const testGql = async () => {
    const schema = await request(endpoint, getIntrospectionQuery());
    const clientSchema = buildClientSchema(schema);
    const schemaSDL = printSchema(clientSchema);
  };

  return (
    <div>
      <h1>OSS</h1>
      <button onClick={testGql}>Get GQL Schema From Endpoint</button>
    </div>
  );
};

export default App;
