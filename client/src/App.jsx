import React, { useEffect, useState } from 'react';
import { Endpoint } from './components/Endpoint';
import Editor from './Editor';
import Visualizer from './components/Visualizer';
import getActivesFromQuery from './utils/getActivesFromQuery';

// backend endpoint: /api/
//graphql tests endpoint: http://localhost:4000/

const App = () => {
  // global state - eventually to be moved to redux
  const [endpoint, setEndpoint] = useState(
    'https://countries.trevorblades.com/'
  );
  const [schema, setSchema] = useState(null);
  const [vSchema, setVSchema] = useState(null);
  const [query, setQuery] = useState(null);
  const [activeTypeIDs, setActiveTypeIDs] = useState(null);
  const [activeFieldIDs, setActiveFieldIDs] = useState(null);

  console.log('vSchema is: ', vSchema);



  useEffect(() => {
    if (!query) return;
    const {activeTypeIDs, activeFieldIDs} = getActivesFromQuery(query, vSchema);

    setActiveTypeIDs(activeTypeIDs);
    setActiveFieldIDs(activeFieldIDs);
  }, [query]);


  console.log('ATI: ', activeTypeIDs);
  console.log('AFI: ', activeFieldIDs);
  return (
    <main>
      <Editor schema={schema} endpoint={endpoint} setQuery={setQuery}></Editor>
      <section className="visualizer-section">
        <Endpoint
          endpoint={endpoint}
          setEndpoint={setEndpoint}
          setSchema={setSchema}
          setVSchema={setVSchema}
        />
        <Visualizer
          vSchema={vSchema}
          activeTypeIDs={activeTypeIDs}
          activeFieldIDs={activeFieldIDs}
        />
      </section>
    </main>
  );
};

export default App;
