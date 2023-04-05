import React, { useEffect, useState, useRef, useContext } from "react";
import { Uri, editor, KeyMod, KeyCode, languages } from "monaco-editor";
import { initializeMode } from "monaco-graphql/esm/initializeMode";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import * as JSONC from "jsonc-parser";
import { debounce } from "../utils/debounce";
import validateBrackets from "../utils/validateBrackets";
import formatReverseQuery from "../utils/formatReverseQuery";
import "../styles/Editor.css";
import { gql } from "graphql-tag";
import * as gqlQB from "gql-query-builder";
import Split from "react-split";
import { DEFAULT_EDITOR_OPTIONS } from "../utils/defaultEditorOptions";
import { calculate_metrics } from "../utils/metrics";

import ReverseContext from "../context/ReverseContext";

/* Default Initial Display for Query Operations */
const defaultOperations =
  // localStorage.getItem("operations") ??
  `
# GQL Request Pane #

query {

}
`;

/* Default Initial Display for Variables */
const defaultVariables =
  // localStorage.getItem("variables") ??
  `
/* Variables Pane */

{}
`;

/* Default Initial Display for Results */
const defaultResults =
  // localStorage.getItem("variables") ??
  "\n/* Results Pane */ \n\n";

/* Get Model at URI, or Create One at URI with Given Value */
const getOrCreateModel = (uri, value) => {
  return (
    editor.getModel(Uri.file(uri)) ??
    editor.createModel(value, uri.split(".").pop(), Uri.file(uri))
  );
};

/* Config: Set this early on so that initial variables with comments don't flash an error */
languages.json.jsonDefaults.setDiagnosticsOptions({
  allowComments: true,
  trailingCommas: "ignore",
});

/* Add Editor to DOM Via its Ref */
const createEditor = (ref, options) => editor.create(ref.current, options);

/** EDITOR COMPONENT **/

export default function Editor({
  schema,
  endpoint,
  setQuery,
  metrics,
  updateMetrics,
}) {
  /********************************************** State & Refs *************************************************/

  const opsRef = useRef(null);
  const varsRef = useRef(null);
  const resultsRef = useRef(null);
  const verticalGutterRef = useRef(null);
  const upperCopyButton = useRef(null);
  const operationErrorMsg = useRef(null);

  const [queryEditor, setQueryEditor] = useState(null);
  const [variablesEditor, setVariablesEditor] = useState(null);
  const [resultsViewer, setResultsViewer] = useState(null);
  const [activeLowerEditor, setActiveLowerEditor] = useState("results");
  const [editorOptions, setEditorOptions] = useState(DEFAULT_EDITOR_OPTIONS);

  const [MonacoGQLAPI, setMonacoGQLAPI] = useState(null);

  const ctx = useContext(ReverseContext);
  // below line is preferable but crashes the app on context save bcz for a moment context object does not exist.
  //in production should work fine
  // const { revQueryObj } = useContext(ReverseContext);

  // Refs for accurate updates
  const currentSchema = useRef(schema);
  const fetcher = useRef(
    endpoint
      ? createGraphiQLFetcher({
          url: endpoint,
        })
      : null
  );

  /********************************************** useEFfect's *************************************************/

  /* Schema Changed: Init MonacoAPI if Needed, Update Config, and Reset Editors */
  useEffect(() => {
    currentSchema.current = schema;
    if (!schema) return;
    if (!MonacoGQLAPI) initMonacoAPI();
    MonacoGQLAPI?.setSchemaConfig([{ introspectionJSON: schema }]);
    editor.getModel(Uri.file("operation.graphql"))?.setValue(defaultOperations);
    editor.getModel(Uri.file("variables.json"))?.setValue(defaultVariables);
    editor.getModel(Uri.file("results.json"))?.setValue(defaultResults);
  }, [schema]);

  /* Update fetcher upon endpoint change */
  useEffect(() => {
    fetcher.current = createGraphiQLFetcher({
      url: endpoint,
    });
  }, [endpoint]);

  /* Instantiate: Once on Mount */
  /* Create the Models & Editors */
  /* Assign Listeners */
  // Models represent the 'virtual files' loaded in each editor
  // Editors are the actual editor instances
  useEffect(() => {
    const queryModel = getOrCreateModel("operation.graphql", defaultOperations);
    const variablesModel = getOrCreateModel("variables.json", defaultVariables);
    const resultsModel = getOrCreateModel("results.json", defaultResults);
    const {
      enableMiniMap,
      verticalScrollbar,
      horizontalScrollbar,
      glyphMargin,
      folding,
      lineNumbersMinChars,
      lineDecorationsWidth,
      lineNumbers,
      isRealTimeFetching,
    } = editorOptions;

    queryEditor ??
      setQueryEditor(
        createEditor(opsRef, {
          theme: "vs-dark",
          model: queryModel,
          language: "graphql",
          automaticLayout: true,
          minimap: {
            enabled: enableMiniMap,
          },
          scrollbar: {
            vertical: verticalScrollbar,
            horizontal: horizontalScrollbar,
          },
          glyphMargin,
          folding,
          lineNumbersMinChars,
          lineDecorationsWidth,
          lineNumbers,
        })
      );
    variablesEditor ??
      setVariablesEditor(
        createEditor(varsRef, {
          theme: "vs-dark",
          model: variablesModel,
          automaticLayout: true,
          minimap: {
            enabled: enableMiniMap,
          },
          scrollbar: {
            vertical: verticalScrollbar,
            horizontal: horizontalScrollbar,
          },
          glyphMargin,
          folding,
          lineNumbersMinChars,
          lineDecorationsWidth,
          lineNumbers,
        })
      );
    resultsViewer ??
      setResultsViewer(
        createEditor(resultsRef, {
          theme: "vs-dark",
          model: resultsModel,
          readOnly: true,
          smoothScrolling: true,
          automaticLayout: true,
          minimap: {
            enabled: enableMiniMap,
          },
          scrollbar: {
            vertical: verticalScrollbar,
            horizontal: horizontalScrollbar,
          },
          glyphMargin,
          folding,
          lineNumbersMinChars,
          lineDecorationsWidth,
          lineNumbers,
        })
      );

    // Assign Change Listeners
    // Debounce to wait 300ms after user stops typing before executing
    // Ref used here for non-stale state
    if (isRealTimeFetching) {
      queryModel.onDidChangeContent(
        debounce(300, () => {
          execOperation(true);
          // localStorage.setItem("operations", queryModel.getValue());
        })
      );
    }
    // variablesModel.onDidChangeContent(
    //   debounce(300, () => {
    //     // localStorage.setItem("variables", variablesModel.getValue());
    //   })
    // );

    verticalGutterRef.current = document.querySelector(".gutter-vertical");
    upperCopyButton.current = document.querySelector(".upper-copy-btn");
    operationErrorMsg.current = document.querySelector(".operation-error-msg");
  }, []);

  /* Assign Keybindings */
  // Wait until editors are actually instantiated before assigning
  useEffect(() => {
    queryEditor?.addAction(queryAction);
    variablesEditor?.addAction(queryAction);
  }, [variablesEditor]);

  /****************************************** Helper Functions ********************************************/
  // NOT CONNECTED OR TESTED
  // function for toggling the RealTimeFetching for querys
  function toggleRealTimeFetching() {
    setEditorOptions({
      ...editorOptions,
      isRealTimeFetching: !editorOptions.isRealTimeFetching,
    });
  }

  /* Get Operations & Validate
     Return: {valid:Boolean <, error:String, operationString:String, operationType:String>} */
  const getOperationsAndValidate = () => {
    if (!currentSchema.current)
      return { valid: false, error: "Please load a valid schema" };

    const markers = editor.getModelMarkers({
      resource: Uri.file("operation.graphql"),
    });
    if (markers.length) return { valid: false, error: "Syntax error" };

    const operations = editor
      .getModel(Uri.file("operation.graphql"))
      .getValue();

    if (!validateBrackets(operations))
      return { valid: false, error: "Invalid brackets" };
    if (operations.trim() === "")
      return { valid: false, error: "Empty operation" };
    try {
      const parsedOperations = gql`
        ${operations}
      `;
      return {
        valid: true,
        operationString: operations,
        operationType: parsedOperations.definitions[0].operation,
      };
    } catch (e) {
      return { valid: false, error: "Invalid operation" };
    }
  };

  /* Execute Current Operation in Request Pane (cmd + enter / submit button / auto)
    'auto' dictates the mode of execution, false meaning standard,
    true meaning real time (post validation) */
  const execOperation = async function (auto = false) {
    const operations = getOperationsAndValidate();
    if (!operations.valid) {
      if (!auto) {
        // Show error message
        operationErrorMsg.current.innerText = operations.error + " 🥺";
        operationErrorMsg.current.classList.add("active");
        setTimeout(() => {
          operationErrorMsg.current.classList.remove("active");
        }, 1200);
      }
      return;
    }
    //TESTING FOR REVERSE MODE
    const DUMMY_OBJ = {
      operation: "continents",
      fields: [
        "code",
        "name",
        { countries: [`code`, `name`, { languages: [`name`, `native`] }] },
      ],
    };

    const { query } = gqlQB.query(DUMMY_OBJ);
    console.log(query);
    const formatted = formatReverseQuery(query);
    // console.log(formatted);

    const queryModel = editor.getModel(Uri.file("operation.graphql"));
    // queryModel?.setValue(formatted);
    //LAST LINE OF TESTING FOR REVERSE MODE

    // Grab the code from the variables pane
    const variables = editor.getModel(Uri.file("variables.json")).getValue();
    // Update query state at top level in order to update active ID's
    setQuery({ queryString: operations.operationString });
    // Do NOT automatically execute mutations
    if (auto && operations.operationType === "mutation") return;
    // Create reference to the results pane
    const resultsModel = editor.getModel(Uri.file("results.json"));
    if (!fetcher.current) return;
    // Make GQL request with given operations, passing in the variables
    const result = await fetcher.current({
      query: operations.operationString,
      variables: JSONC.parse(variables),
    });

    // Note: this app only supports a single iteration for http GET/POST,
    // no multipart or subscriptions yet.
    const data = await result.next();

    // update metrics
    const newMetrics = calculate_metrics(endpoint);
    newMetrics.lastResponseType = "Query";
    console.log(newMetrics);
    updateMetrics(newMetrics);

    // Display the results in results pane
    resultsModel?.setValue(
      defaultResults + JSON.stringify(data.value, null, 2)
    );
  };

  /* Keyboard Action For Executing Operation (cmd + enter) */
  const queryAction = {
    id: "graphql-run",
    label: "Run Operation",
    contextMenuOrder: 0,
    contextMenuGroupId: "graphql",
    keybindings: [
      // eslint-disable-next-line no-bitwise
      KeyMod.CtrlCmd | KeyCode.Enter,
    ],
    run: () => execOperation(false),
  };

  /* Configure Monaco API & Connect to GraphQL Validation */
  const initMonacoAPI = () => {
    setMonacoGQLAPI(
      initializeMode({
        // Pair request pane with variables pane for validation
        diagnosticSettings: {
          validateVariablesJSON: {
            [Uri.file("operation.graphql").toString()]: [
              Uri.file("variables.json").toString(),
            ],
          },
          jsonDiagnosticSettings: {
            validate: true,
            schemaValidation: "error",
            // set these again, because we are entirely re-setting them here
            allowComments: true,
            trailingCommas: "ignore",
          },
        },
        schemas: [
          {
            introspectionJSON: currentSchema.current,
            // uri: 'myschema.graphql', // You can have multiple schemas if you want
          },
        ],
      })
    );
  };

  // /* Copy the Editor Contents */
  async function copyEditorField(e, ref) {
    try {
      let uriFile;
      // set the uriFile name based on ref
      if (ref === opsRef) uriFile = "operation.graphql";
      else if (ref === varsRef) uriFile = "variables.json";
      else if (ref === resultsRef) uriFile = "results.json";
      else return;
      // retrieve the contents of the uriFile
      const operations = editor.getModel(Uri.file(uriFile)).getValue().trim();
      // copy to clipboard
      await navigator.clipboard.writeText(operations);
      const copyButton = e.target;
      copyButton.innerText = "copied!";
      setTimeout(() => (copyButton.innerText = "copy"), 800);
    } catch (err) {
      copyButton.innerText = "error!";
      setTimeout(() => (copyButton.innerText = "copy"), 800);
    }
  }

  /* Hide Upper Copy Button Before Overlap Occurs */
  const handleVerticalDrag = () => {
    const viewportOffset = verticalGutterRef.current.getBoundingClientRect();
    if (viewportOffset.top < 145)
      upperCopyButton.current.classList.add("hidden");
    else upperCopyButton.current.classList.remove("hidden");
  };

  /************************************************ Render ******************************************************/

  return (
    <div className="monaco-container">
      <section className="editor-pane">
        <Split
          sizes={[49, 51]}
          minSize={5}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          dragInterval={1}
          direction="vertical"
          cursor="row-resize"
          className="query-results-split"
          onDrag={handleVerticalDrag}
        >
          <section className="editor-container query-editor">
            <div ref={opsRef} className="editor" />
            <button
              className="copy-btn upper-copy-btn"
              onClick={(e) => copyEditorField(e, opsRef)}
            >
              copy
            </button>
            <button
              onClick={() => execOperation(false)}
              className="submit-query-button"
            >
              Submit
            </button>
            <span className="operation-error-msg"></span>
          </section>
          <section className="lower-editor-section">
            <header className="lower-editor-tabs">
              <button
                className={`lower-editor-button results-button ${
                  activeLowerEditor === "results" ? "active-tab" : ""
                }`}
                onClick={() => setActiveLowerEditor("results")}
              >
                Results
              </button>
              <button
                className={`lower-editor-button variables-button ${
                  activeLowerEditor === "variables" ? "active-tab" : ""
                }`}
                onClick={() => setActiveLowerEditor("variables")}
              >
                Variables
              </button>
            </header>
            <article
              className={`editor-container ${
                activeLowerEditor === "results" ? "hidden" : ""
              }`}
            >
              <div ref={varsRef} className="editor vars-editor" />
              <button
                className="copy-btn"
                onClick={(e) => copyEditorField(e, varsRef)}
              >
                copy
              </button>
            </article>
            <article
              className={`editor-container ${
                activeLowerEditor === "variables" ? "hidden" : ""
              }`}
            >
              <div ref={resultsRef} className="editor" />
              <button
                className="copy-btn"
                onClick={(e) => copyEditorField(e, resultsRef)}
              >
                copy
              </button>
            </article>
            <article className="metrics__container">
              {metrics && (
                <p className="metrics__text">
                  {metrics.lastResponseType} response time:{" "}
                  <span className="metrics__data">{metrics.responseTime}</span>{" "}
                  ms
                </p>
              )}
            </article>
          </section>
        </Split>
      </section>
    </div>
  );
}
