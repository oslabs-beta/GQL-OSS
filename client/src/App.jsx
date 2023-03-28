import React, { useState } from 'react';
import { Endpoint } from './components/Endpoint';
import Editor from './Editor';
import Visualizer from './components/Visualizer';
import Split from 'react-split'
import './styles/App.css'

// backend endpoint: /api/
//graphql tests endpoint: http://localhost:4000/

const App = () => {
  // global state - eventually to be moved to redux
  const [endpoint, setEndpoint] = useState(
    'https://countries.trevorblades.com/'
  );
  const [schema, setSchema] = useState(null);
  const [vSchema, setVSchema] = useState(null);

  const [sizes, setSizes] = useState(['30%', '70%', 'auto'])

  return (
    <main>
        <Split className='split' sizes={[25,75]} style={{height: "100vh", width: "100vw"}}>
          <div class="seg-holder">
            <Editor id='editor' schema={schema} endpoint={endpoint} ></Editor>
          </div>
          <div class="seg-holder">
            <section className="visualizer-section">
              <Endpoint
                endpoint={endpoint}
                setEndpoint={setEndpoint}
                setSchema={setSchema}
                setVSchema={setVSchema}
                />
              <Visualizer vSchema={vSchema}></Visualizer>
            </section>
          </div>
        </Split>
    </main>
  );
};

export default App;
