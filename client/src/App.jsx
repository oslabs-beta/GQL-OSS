import React, {useCallback} from 'react';
import ReactFlow, { 
  MiniMap,
  Controls,
  Background,
  useNodesState, 
  useEdgesState, 
  addEdge 
} from 'reactflow'; //added for ReactFlow

import 'reactflow/dist/style.css'; //added for ReactFlow

import { request, gql } from 'graphql-request';

// ************ReactFlow Playground****************





const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];







// ************************************************


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
  const testGql = async () => {
    const endpoint =
      'https://swapi-graphql.netlify.app/.netlify/functions/index';
    const data = await request(endpoint, query);
    console.log(data);
    const schema = await request(endpoint, introspection);
    console.log(schema);
  };

  //Commented out to make room for ReactFlow
  // return (
  //   <div>
  //     <h1>OSS: Our app</h1>
  //     <button onClick={testGql}>Send gql request</button>
  //   </div>
  // );

  //*** React Playground *** *//

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  //*** **************** *** *//

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'beige'}}>
      <ReactFlow 
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1}/>
        </ReactFlow>
    </div>
  );

};

export default App;
