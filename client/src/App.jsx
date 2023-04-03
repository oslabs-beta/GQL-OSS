import React, { useEffect, useState, useRef } from "react";
import { Endpoint } from "./components/Endpoint";
import Editor from "./components/Editor";
import Visualizer from "./components/Visualizer";
import Split from "react-split";
import "./styles/App.css";
import getActivesFromQuery from "./utils/getActivesFromQuery";

const App = () => {
  /********************************************** State & Refs *************************************************/

  // TODO: redux refactor (for only the necessary global pieces)
  const [endpoint, setEndpoint] = useState(
    "https://countries.trevorblades.com/"
  );

  /* Setting default highlight/edge colors */
  const colors = {
    nodeHighlight: '#91EECF',
    fieldHighlight: '#add8e6',
    edgeDefault: '#6495ed',
    edgeHighlight: '#FAD000'
  }

  const [schema, setSchema] = useState(null);
  const [vSchema, setVSchema] = useState(null);
  const [query, setQuery] = useState(null);
  const [activeTypeIDs, setActiveTypeIDs] = useState(null);
  const [activeFieldIDs, setActiveFieldIDs] = useState(null);
  const [activeEdgeIDs, setActiveEdgeIDs] = useState(null);
  const [displayMode, setDisplayMode] = useState("all");
  const [customColors, setCustomColors] = useState(colors)
  const [ghostMode, setGhostMode] = useState("off")
  const [ghostNodeIDs, setGhostNodeIDs] = useState(null)
  const [ghostEdgeIDs, setGhostEdgeIDs] = useState(null)

  /********************************************** useEFfect's *************************************************/

  /* Highlight Active Query */
  // If the user executes a query, update the active ID's for Types, Fields, & Edges
  useEffect(() => {
    if (query === null) return;
    const { queryString } = query;
    console.log('vSchema : ', vSchema)
    const activeIDs = getActivesFromQuery(queryString, vSchema);
    if (activeIDs === null) return;
    const { activeTypeIDs, activeFieldIDs, activeEdgeIDs } = activeIDs;
    setActiveTypeIDs(activeTypeIDs);
    setActiveFieldIDs(activeFieldIDs);
    setActiveEdgeIDs(activeEdgeIDs);
  }, [query]);

  /* Reset Actives */
  // If the schema is changed or reset, then reset all active ID's back to null
  useEffect(() => {
    setActiveTypeIDs(null);
    setActiveFieldIDs(null);
    setActiveEdgeIDs(null);
  }, [vSchema]);

  const fullscreenVisualizer = () => {
    const el = document.querySelector(".visualizer-container")
    el.requestFullscreen()
  }

  /************************************************ Render ******************************************************/

  return (
    <main>
      <section className="toolbar">
        <Endpoint
            endpoint={endpoint}
            setEndpoint={setEndpoint}
            setSchema={setSchema}
            setVSchema={setVSchema}
          />
          <button onClick={fullscreenVisualizer}>Fullscreen</button>
      </section>
      
      <Split className="split" sizes={[28, 72]} minSize={5} snapOffset={50}>
        <section className="seg-holder editor-section">
          <Editor
            id="editor"
            schema={schema}
            endpoint={endpoint}
            setQuery={setQuery}
          ></Editor>
        </section>
        <section className="seg-holder visualizer-section">
          <Visualizer
            vSchema={vSchema}
            activeTypeIDs={activeTypeIDs}
            activeFieldIDs={activeFieldIDs}
            activeEdgeIDs={activeEdgeIDs}
            displayMode={displayMode}
            setDisplayMode={setDisplayMode}
            customColors={customColors} 
            setCustomColors={setCustomColors}
            ghostMode={ghostMode}
            setGhostMode={setGhostMode}
            ghostNodeIDs={ghostNodeIDs}
            setGhostNodeIDs={setGhostNodeIDs}
            ghostEdgeIDs={ghostEdgeIDs}
            setGhostEdgeIDs={setGhostEdgeIDs}
          />
        </section>
      </Split>
    </main>
  );
};

export default App;
