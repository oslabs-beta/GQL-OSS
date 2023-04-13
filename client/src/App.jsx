import React, { useEffect, useState, useRef, useContext } from "react";
import { Endpoint } from "./components/Endpoint";
import Editor from "./components/Editor";
import Visualizer from "./components/Visualizer";
import { HelpButton } from "./components/HelpButton";
import Split from "react-split";
import "./styles/App.css";
import getActivesFromQuery from "./utils/getActivesFromQuery";
import ReverseContext from "./context/ReverseContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { calculateMetrics } from "./utils/calculateMetrics";

/* Default colors for edges and fields */
const DEFAULT_COLORS = {
  fieldHighlight: "#283145",
  edgeDefault: "#6495ED",
  edgeHighlight: "#FF00A2",
};

const App = () => {
  /********************************************** State & Refs *************************************************/

  // TODO: redux refactor
  const [endpoint, setEndpoint] = useState(null);
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
  const [loaderHidden, setLoaderHidden] = useState(true);

  const endpointRef = useRef(null);

  const {
    reverseMode,
    setReverseMode,
    reverseModeError,
    setReverseModeError,
    resetReverseContext,
    mutationMode,
  } = useContext(ReverseContext);

  /********************************************** useEffect's *************************************************/

  /* Highlight Active Request */
  // If the user executes a request, update the active ID's for Types, Fields, & Edges
  useEffect(() => {
    if (query === null) return;
    const { queryString } = query;
    const activeIDs = getActivesFromQuery(queryString, vSchema);
    if (activeIDs === null) return;
    const { activeTypeIDs, activeFieldIDs, activeEdgeIDs } = activeIDs;
    setActiveTypeIDs(activeTypeIDs);
    setActiveFieldIDs(activeFieldIDs);
    setActiveEdgeIDs(activeEdgeIDs);
  }, [query]);

  /* Reset Actives */
  // If the schema is changed or reset, then reset all active ID's back to null
  // Reset all relevant mode state as well
  useEffect(() => {
    setActiveTypeIDs(null);
    setActiveFieldIDs(null);
    setActiveEdgeIDs(null);
    setGhostNodeIDs(new Set());
    setGhostEdgeIDs(new Set());
    setDisplayMode("all");
    setReverseMode(false);
    resetReverseContext();
  }, [vSchema]);

  // When reverse mode toggles, reset relevant state, and restrict certain modes in conjunction
  useEffect(() => {
    if (reverseMode) {
      setActiveEdgeIDs(null);
      setDisplayMode("activeOnly");
      setGhostMode("on");
      if (vSchema) {
        setActiveTypeIDs(
          new Set([vSchema.queryName.name, vSchema.mutationName?.name])
        );
      }
      setActiveFieldIDs(null);
      setGhostNodeIDs(new Set());
      setGhostEdgeIDs(new Set());
      resetReverseContext();
    }
  }, [reverseMode]);

  // If active only mode is set to off, turn ghost mode off (NB: ghost mode === suggestions, displayMode === active only)
  useEffect(() => {
    if (displayMode === "all") setGhostMode("off");
  }, [displayMode]);

  /* update endpointRef for updateMetrics to access current endpoint */
  useEffect(() => {
    endpointRef.current = endpoint;
  }, [endpoint]);

  /********************************************** Helper Functions *************************************************/

  /* Prevent Left Pane From Forcing Overflow (Artifact. No longer used, but can be helpful for UX changes) */
  // const handleHorizontalDrag = (sizes) => {
  //   if (sizes[0] > 49) {
  //     editorVizSplit.current.split.setSizes([49, 51]);
  //   }
  // };

  // accesses performance object
  // calculates query time of the last PerformanceEntry that interacted w/endpoint
  // assigns a name ('Introspection' || 'Query') to metrics.lastResponseType
  function updateMetrics() {
    const newMetricsProperties = calculateMetrics(endpointRef.current);
    if (newMetricsProperties) {
      setMetrics({
        ...metrics,
        ...newMetricsProperties,
      });
    }
  }
  /************************************************ Render ******************************************************/
  return (
    <main>
      <nav className="toolbar">
        <div className="logo__container"></div>
        <Endpoint
          endpoint={endpoint}
          setEndpoint={setEndpoint}
          setSchema={setSchema}
          setVSchema={setVSchema}
          updateMetrics={updateMetrics}
        />
        <h1 className="toolbar__header">
          <span>GraphQL</span> One Stop Shop
        </h1>
        <HelpButton type="github-hb" />
        <HelpButton type="help-hb" />
      </nav>

      <Split
        ref={editorVizSplit}
        className="editor-visualizer-split"
        sizes={[27, 73]}
        minSize={5}
        snapOffset={50}
        // onDrag={handleHorizontalDrag}
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
            loaderHidden={loaderHidden}
            setLoaderHidden={setLoaderHidden}
          />
        </section>
      </Split>

      <Snackbar
        open={reverseModeError !== null && vSchema !== null}
        autoHideDuration={1700}
        onClose={() => {
          setReverseModeError(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        style={
          mutationMode === true ? { transform: `translate(-50%,-55px)` } : null
        }
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          {reverseModeError}
        </Alert>
      </Snackbar>
      <Snackbar
        open={mutationMode === true && vSchema !== null}
        autoHideDuration={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          {mutationMode &&
            `Mutations require MANUAL submission and WILL affect your data`}
        </Alert>
      </Snackbar>
    </main>
  );
};

export default App;
