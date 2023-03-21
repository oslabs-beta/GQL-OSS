import React, { useState } from 'react';

import { request, gql } from 'graphql-request';
import { EndpointInput } from './components/EndpointInput';

// backend endpoint: /api/

//graphql tests endpoint: http://localhost:4000/

const query = gql`
  query Query {
    allFilms {
      films {
        title
        director
        releaseDate
        speciesConnection {
          species {
            name
            classification
            homeworld {
              name
            }
          }
        }
      }
    }
  }
`;

const introspection = gql`
  query IntrospectionQuery {
    __schema {
      queryType {
        name
      }
      mutationType {
        name
      }
      subscriptionType {
        name
      }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

const App = () => {
  const [endpoint, setEndpoint] = useState('https://swapi-graphql.netlify.app/.netlify/functions/index');

  const testGql = async () => {
    // const endpoint =
    //   'https://swapi-graphql.netlify.app/.netlify/functions/index';
    const data = await request(endpoint, query);
    console.log(data);
    const schema = await request(endpoint, introspection);
    console.log(schema);
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
