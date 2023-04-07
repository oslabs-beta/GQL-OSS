import React, { useEffect, useState, useRef, useContext } from "react";
import { Endpoint } from "./components/Endpoint";
import Editor from "./components/Editor";
import Visualizer from "./components/Visualizer";
import Split from "react-split";
import "./styles/App.css";
import getActivesFromQuery from "./utils/getActivesFromQuery";
import ReverseContext from "./context/ReverseContext";

const DEFAULT_ENDPOINT = "https://countries.trevorblades.com/";

/* Setting default highlight/edge colors */
const DEFAULT_COLORS = {
  fieldHighlight: "#283145",
  edgeDefault: "#6495ED",
  edgeHighlight: "#FF00A2",
};

const App = () => {
  /********************************************** State & Refs *************************************************/

  // TODO: redux refactor (for only the necessary global pieces)
  const [endpoint, setEndpoint] = useState(DEFAULT_ENDPOINT);
  const [schema, setSchema] = useState(null);
  const [vSchema, setVSchema] = useState(null);
  const [query, setQuery] = useState(null);
  const [activeTypeIDs, setActiveTypeIDs] = useState(null);
  const [activeFieldIDs, setActiveFieldIDs] = useState(null);
  const [activeEdgeIDs, setActiveEdgeIDs] = useState(null);
  const [displayMode, setDisplayMode] = useState("all");
  const editorVizSplit = useRef(null);
  const [customColors, setCustomColors] = useState(DEFAULT_COLORS);
  const [ghostMode, setGhostMode] = useState("off");
  const [ghostNodeIDs, setGhostNodeIDs] = useState(new Set());
  const [ghostEdgeIDs, setGhostEdgeIDs] = useState(new Set());
  const [metrics, setMetrics] = useState(null);

  const { reverseMode, setReverseMode } = useContext(ReverseContext);

  /********************************************** useEffect's *************************************************/

  /* Highlight Active Query */
  // If the user executes a query, update the active ID's for Types, Fields, & Edges
  useEffect(() => {
    if (query === null) return;
    const { queryString } = query;
    // console.log("vSchema : ", vSchema);
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
    setDisplayMode("all");
    setReverseMode(false);
  }, [vSchema]);

  useEffect(() => {
    if (reverseMode) {
      setDisplayMode("activeOnly");
      setGhostMode("on");
      setActiveTypeIDs(new Set([vSchema.queryName.name]));
    } else {
      setActiveTypeIDs(null);
    }
    setActiveFieldIDs(null);
    setActiveEdgeIDs(null);
  }, [reverseMode]);

  useEffect(() => {
    if (displayMode === "all") setGhostMode("off");
  }, [displayMode]);

  /********************************************** Helper Functions *************************************************/

  /* Prevent Left Pane From Forcing Overflow */
  const handleHorizontalDrag = (sizes) => {
    if (sizes[0] > 49) {
      editorVizSplit.current.split.setSizes([49, 51]);
    }
  };

  const fullscreenVisualizer = () => {
    const el = document.querySelector(".visualizer-container");
    el.requestFullscreen();
  };

  /************************************************ Helper Functions ********************************************/
  function updateMetrics(newMetricsProperties) {
    setMetrics({
      ...metrics,
      ...newMetricsProperties,
    });
  }

  /************************************************ Render ******************************************************/

  return (
    <main>
      <nav className="toolbar">
        {/* TODO: Make the fullscreen button a custom control input component that goes with the other buttons */}
        <button className="fullscreen-btn" onClick={fullscreenVisualizer}>
          Fullscreen
        </button>
        <Endpoint
          endpoint={endpoint}
          setEndpoint={setEndpoint}
          setSchema={setSchema}
          setVSchema={setVSchema}
          updateMetrics={updateMetrics}
        />
      </nav>

      <Split
        ref={editorVizSplit}
        className="editor-visualizer-split"
        sizes={[27, 73]}
        minSize={5}
        snapOffset={50}
        onDrag={handleHorizontalDrag}
      >
        <section className="seg-holder editor-section">
          <Editor
            id="editor"
            schema={schema}
            endpoint={endpoint}
            setQuery={setQuery}
            updateMetrics={updateMetrics}
            metrics={metrics}
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
