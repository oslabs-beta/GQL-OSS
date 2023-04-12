import React, { useEffect, useState, useRef, useContext } from "react";
import { Uri, editor, KeyMod, KeyCode, languages } from "monaco-editor";
import { initializeMode } from "monaco-graphql/esm/initializeMode";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import * as JSONC from "jsonc-parser";
import { debounce } from "../utils/debounce";
import validateBrackets from "../utils/validateBrackets";
import "../styles/Editor.css";
import { gql } from "graphql-tag";
import Split from "react-split";
import { ToggleSwitch } from "./ToggleSwitch";
import { DEFAULT_EDITOR_OPTIONS } from "../utils/defaultEditorOptions";
import ReverseContext from "../context/ReverseContext";
import Tooltip from "@mui/material/Tooltip";

/******************************************************************************************************************/
/******************************************** PRE CONFIG FOR EDITOR ***********************************************/
/******************************************************************************************************************/

/* Default Initial Display for Operations */
const defaultOperations = `
# GQL Request Pane #

query {

}
`;

/* Default Initial Display for Reverse-Mode Operations */
const defaultReverseOperations = `
# Reverse Mode #
# Build a request in the visualizer #

query {

}
`;

/* Default Initial Display for Variables */
const defaultVariables = `
/* Variables Pane */

{}
`;

/* Default Initial Display for Results */
const defaultResults = "\n/* Results Pane */ \n\n";

/* Get Model at URI, or Create One at URI with Given Value
   NB: Monaco has a virtual file system / memory manager. Think of URI's as simple unique ID's for this internal system */
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

/******************************************************************************************************************/
/********************************************** EDITOR COMPONENT **************************************************/
/******************************************************************************************************************/

export default function Editor({
  schema,
  endpoint,
  setQuery,
  metrics,
  updateMetrics,
}) {
  /********************************************** State & Refs *************************************************/

  const opsRef = useRef(null); // operations editor pane (the actual DOM element)
  const varsRef = useRef(null); // variables editor pane (the actual DOM element)
  const resultsRef = useRef(null); // results editor pane (the actual DOM element)
  const verticalGutterRef = useRef(null);
  const upperCopyButton = useRef(null);
  const operationErrorMsg = useRef(null);
  const liveQueryModeRef = useRef(DEFAULT_EDITOR_OPTIONS.liveQueryMode);
  // Refs for accurate updates and un-stale state
  const currentSchema = useRef(schema);
  const fetcher = useRef(
    endpoint
      ? createGraphiQLFetcher({
          url: endpoint,
        })
      : null
  );

  const [queryEditor, setQueryEditor] = useState(null);
  const [variablesEditor, setVariablesEditor] = useState(null);
  const [resultsViewer, setResultsViewer] = useState(null);
  const [activeLowerEditor, setActiveLowerEditor] = useState("results");
  const [editorOptions, setEditorOptions] = useState(DEFAULT_EDITOR_OPTIONS);
  const [MonacoGQLAPI, setMonacoGQLAPI] = useState(null);

  const {
    formattedQuery,
    reverseMode,
    setReverseMode,
    resetReverseContext,
    setMutationMode,
  } = useContext(ReverseContext);
  // below line is preferable but crashes the app on context save bcz for a moment context object does not exist.
  //in production should work fine
  // const { revQueryObj } = useContext(ReverseContext);

  /************************************************* useEffect's ****************************************************/

  /* Update liveQueryModeRef to prevent stale state in queryModel.onDidChangeContent */
  useEffect(() => {
    liveQueryModeRef.current = editorOptions.liveQueryMode;
  }, [editorOptions.liveQueryMode]);

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

    // editorOptions to be used in createEditor()
    // default options are currently set in ../utils/defaultEditorOptions.js
    const {
      enableMiniMap,
      verticalScrollbar,
      horizontalScrollbar,
      glyphMargin,
      folding,
      lineNumbersMinChars,
      lineDecorationsWidth,
      lineNumbers,
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
            enabled: true,
          },
          scrollbar: {
            vertical: true,
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
    // only runs execOperation when liveQueryMode is engaged
    // liveQueryModeRef used here for non-stale state
    queryModel.onDidChangeContent(
      debounce(300, () => {
        const operations = editor
          .getModel(Uri.file("operation.graphql"))
          .getValue();
        if (operations.includes(`mutation`)) {
          setMutationMode(true);
        } else {
          setMutationMode(false);
        }
        if (liveQueryModeRef.current) execOperation(true);
      })
    );

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

  useEffect(() => {
    if (!formattedQuery) return;
    editor
      .getModel(Uri.file("operation.graphql"))
      ?.setValue(
        "\n# Reverse Mode #\n# Build a request in the visualizer #\n\n" +
          formattedQuery
      );
  }, [formattedQuery]);

  useEffect(() => {
    if (reverseMode) {
      resetReverseContext();
      editor.getModel(Uri.file("results.json"))?.setValue(defaultResults);
      editor.getModel(Uri.file("variables.json"))?.setValue(defaultVariables);
      editor
        .getModel(Uri.file("operation.graphql"))
        ?.setValue(defaultReverseOperations);
    }
    queryEditor?.updateOptions({ readOnly: reverseMode });
    setActiveLowerEditor("results");
  }, [reverseMode]);

  /****************************************** Helper Functions ********************************************/

  // Toggle functionality for live query mode
  function toggleLiveQueryMode() {
    setEditorOptions((prevOptions) => ({
      ...prevOptions,
      liveQueryMode: !prevOptions.liveQueryMode,
    }));
  }

  /* Get Operations & Validate (Simple Validation)
    This function validates before highlighting occurs. Checks that the ops string can even be GQL
    Return: {valid:Boolean <, error:String, operationString:String, operationType:String>} */
  const getOperationsAndValidate = () => {
    if (!currentSchema.current)
      return { valid: false, error: "Please load a valid schema" };

    const operations = editor
      .getModel(Uri.file("operation.graphql"))
      .getValue();

    // Sanitize the string of any parentheses and characters within (variables)
    // This is to dovetail with Reverse Context framework
    const sanitizedOperations = operations.replaceAll(/\([^)]*\)/g, "");

    try {
      const parsedOperations = gql`
        ${sanitizedOperations}
      `;
      return {
        valid: true,
        operationString: sanitizedOperations,
        operationType: parsedOperations.definitions[0].operation,
      };
    } catch (e) {
      return { valid: false, error: "Invalid operation" };
    }
  };

  /* Validate Ops Pre Request (Through Fetcher)
    This function peforms stricter validation on ops to make sure only valid requests are sent
    Return: {valid:Boolean <, error:String, operationString:String} */
  const getAndValidateOpsStrictPreRequest = () => {
    const operations = editor
      .getModel(Uri.file("operation.graphql"))
      .getValue();
    const markers = editor.getModelMarkers({
      resource: Uri.file("operation.graphql"),
    });
    if (markers.length) return { valid: false, error: "Syntax error" };
    if (!validateBrackets(operations))
      return { valid: false, error: "Invalid brackets" };
    if (operations.trim() === "")
      return { valid: false, error: "Empty operation" };
    return {
      valid: true,
      operationString: operations,
    };
  };

  /* Execute Current Operation in Request Pane (cmd + enter / submit button / auto)
    'auto' dictates the mode of execution, false meaning standard,
    true meaning real time (post validation) */
  const execOperation = async function (auto = false) {
    // Check if the operations are valid for highlighting
    // (There is more validation within the getActives utility function itself)
    const sanitizedOperations = getOperationsAndValidate();
    if (!sanitizedOperations.valid) {
      if (!auto) {
        // Show error messages only when operations are explicitly executed (not through live/auto)
        operationErrorMsg.current.innerText = sanitizedOperations.error + " 🥺";
        operationErrorMsg.current.classList.add("active");
        setTimeout(() => {
          operationErrorMsg.current.classList.remove("active");
        }, 1200);
      }
      return;
    }

    // Update query state at top level in order to update active ID's for highlighting
    setQuery({ queryString: sanitizedOperations.operationString });

    /* Short Circuiting Conditions Pre-Request Sending Through Fetcher */
    // Do NOT automatically execute mutations
    if (auto && sanitizedOperations.operationType === "mutation") return;
    if (!fetcher.current) return;
    const operationsPreRequest = getAndValidateOpsStrictPreRequest();
    if (!operationsPreRequest.valid) {
      if (!auto) {
        // Show error message
        operationErrorMsg.current.innerText =
          operationsPreRequest.error + " 🥺";
        operationErrorMsg.current.classList.add("active");
        setTimeout(() => {
          operationErrorMsg.current.classList.remove("active");
        }, 1200);
      }
      return;
    }

    /* All good now to send a real request and receive data response! */

    // Grab the code from the variables pane
    const variables = editor.getModel(Uri.file("variables.json")).getValue();
    // Create reference to the results pane
    const resultsModel = editor.getModel(Uri.file("results.json"));
    // Make GQL request with given operations, passing in the variables
    const result = await fetcher.current({
      query: operationsPreRequest.operationString,
      variables: JSONC.parse(variables),
    });

    // Note: this app only supports a single iteration for http GET/POST,
    // no multipart or subscriptions yet.
    const data = await result.next();

    //check response timing data and update metrics
    updateMetrics();

    // Display the results in results pane
    resultsModel?.setValue(
      defaultResults + JSON.stringify(data.value, null, 2)
    );

    // Switch to the results tab if not in live query mode
    if (!auto) setActiveLowerEditor("results");
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

      // filter comments from copied operations text
      // complex regex: https://regex101.com/r/B8WkuX/1
      // will filter comments:
      //  /* This Will Be filtered */
      //
      //  /*
      //   * This Will Also Be filtered
      //  */
      //
      //  // This will be filtered as long as not preceeded by a semicolon (i.e. a URL)
      //
      //  # a pair of pound signs and everything inside will be filtered #
      const filteredOperations = operations
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, "$1")
        .replace(/#[^#]*#/gm, "");

      // copy to clipboard
      await navigator.clipboard.writeText(filteredOperations);
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
            <Tooltip title={"Try cmd/ctrl + enter :)"}>
              <button
                onClick={() => execOperation(false)}
                className="submit-query-button"
              >
                Submit
              </button>
            </Tooltip>
            <div className="reverse-toggle-switch-container">
              <ToggleSwitch
                toggleName="Reverse Mode"
                labelLeft="off"
                labelRight="on"
                isChecked={reverseMode}
                handleChange={() => {
                  setReverseMode((prevMode) => {
                    if (prevMode === false)
                      setEditorOptions((prevOptions) => ({
                        ...prevOptions,
                        liveQueryMode: true,
                      }));
                    return !prevMode;
                  });
                }}
              />
            </div>
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
                  {metrics.lastResponseType} time:{" "}
                  <span className="metrics__data">{metrics.responseTime}</span>{" "}
                  ms
                </p>
              )}
              <div className="RT-toggle__container">
                <h6 className="RT-toggle__text">Live:</h6>
                <ToggleSwitch
                  labelLeft="off"
                  labelRight="on"
                  handleChange={toggleLiveQueryMode}
                  isChecked={editorOptions.liveQueryMode}
                  id={"liveQueryToggle"}
                />
              </div>
            </article>
          </section>
        </Split>
      </section>
    </div>
  );
}
