import React, { useEffect, useState } from "react";
import { Endpoint } from "./components/Endpoint";
import Editor from "./components/Editor";
import Visualizer from "./components/Visualizer";
import Split from "react-split"
import "./styles/App.css"
import getActivesFromQuery from "./utils/getActivesFromQuery";
import { initialVisualizerOptions } from "./utils/initialVisualizerOptions";

// backend endpoint: /api/
//graphql tests endpoint: http://localhost:4000/

const App = () => {
  // global state - eventually to be moved to redux
  const [endpoint, setEndpoint] = useState(
    "https://countries.trevorblades.com/"
  );
  const [schema, setSchema] = useState(null);
  const [vSchema, setVSchema] = useState(null);
  const [query, setQuery] = useState(null);
  const [activeTypeIDs, setActiveTypeIDs] = useState(null);
  const [activeFieldIDs, setActiveFieldIDs] = useState(null);
  const [activeEdgeIDs, setActiveEdgeIDs] = useState(null);
  const [displayMode, setDisplayMode] = useState('all');
  const [visualizerOptions, setVisualizerOptions] = useState(
    initialVisualizerOptions
  );

  // If the user executes a query, update the active ID's
  useEffect(() => {
    if (query === null) return;
    const { activeTypeIDs, activeFieldIDs, activeEdgeIDs } = getActivesFromQuery(query, vSchema);
    setActiveTypeIDs(activeTypeIDs);
    setActiveFieldIDs(activeFieldIDs);
    setActiveEdgeIDs(activeEdgeIDs);
  }, [query]);

  // console.log('ATIDs: ', activeTypeIDs );
  // console.log('AFIDs: ', activeFieldIDs );
  // console.log('AEIDs: ', activeEdgeIDs );
  // console.log('displayMode: ', displayMode);
  console.log('IN APP schema is: ', schema);
  return (
    <main>
        <Split className='split' sizes={[25,75]} style={{height: "100vh", width: "100vw"}}>
          <div className="seg-holder">
            <Editor id='editor' schema={schema} endpoint={endpoint} setQuery={setQuery} ></Editor>
          </div>
          <div className="seg-holder">
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
                activeEdgeIDs={activeEdgeIDs}
                visualizerOptions={visualizerOptions}
                setVisualizerOptions={setVisualizerOptions}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
              />
            </section>
          </div>
        </Split>
    </main>
  );
};

export default App;
