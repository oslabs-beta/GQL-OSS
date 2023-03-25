import React, { useState } from 'react';
import { Endpoint } from './components/Endpoint';
import Editor from './Editor';
import Visualizer from './components/Visualizer';

// backend endpoint: /api/
//graphql tests endpoint: http://localhost:4000/

const App = () => {
  // global state - eventually to be moved to redux
  const [endpoint, setEndpoint] = useState(
    'https://countries.trevorblades.com/'
  );
  const [schema, setSchema] = useState(null);
  const [vSchema, setVSchema] = useState(null);


  return (
    <main>
      <Editor schema={schema} endpoint={endpoint}></Editor>
      <section className="endpoint-section">
        <Endpoint 
          endpoint={endpoint} 
          setEndpoint={setEndpoint}
          setSchema={setSchema}
          setVSchema={setVSchema}
        />
        <Visualizer vSchema={vSchema}></Visualizer>
      </section>
    </main>
  );
};

export default App;
