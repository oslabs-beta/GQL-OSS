import React, { useEffect, useState, useRef } from "react";
import { Uri, editor, KeyMod, KeyCode, languages } from "monaco-editor";
import { initializeMode } from "monaco-graphql/esm/initializeMode";
import { createGraphiQLFetcher } from "@graphiql/toolkit";
import * as JSONC from "jsonc-parser";
import { debounce } from "./utils/debounce";
import validateBrackets from "./utils/validateBrackets";
import { defaultEditorOptions } from "./utils/defaultEditorOptions";
import Split from "react-split";
import "./styles/Editor.css";

// description that is displayed in request pane above actual code
// indicate to the user what commands are available and defined
// see below: 'queryAction'
const defaultOperations =
  localStorage.getItem("operations") ??
  `
# GQL Request Pane
# cmd/ctrl + return/enter will execute the operation
# Also available via context menu & f1 command palette

query {

}
`;

// same as above but for the variables pane
const defaultVariables =
  localStorage.getItem("variables") ??
  `
/* Variables Pane
cmd/ctrl + return/enter will execute the operation
Format your variables as valid JSON */

{

}
`;

// docs here are sparse
// i believe that the URI here is *internally* looking into monaco config files
// to find the proper model which is specified as an argument.
// if a URI such as 'operation/graphql' is passed in and is resolved to a real model,
// then that model will be returned. (model being the document utilized in the editor)
// otherwise, the model is created
const getOrCreateModel = (uri, value) => {
  return (
    editor.getModel(Uri.file(uri)) ??
    editor.createModel(value, uri.split(".").pop(), Uri.file(uri))
  );
};

// set these early on so that initial variables with comments don't flash an error
// NOTE: This may set up options for the variables being cross checked across the schema
// may need more here
languages.json.jsonDefaults.setDiagnosticsOptions({
  allowComments: true,
  trailingCommas: "ignore",
});

// add editor to DOM
// ref is the element the editor will hook onto
const createEditor = (ref, options) => editor.create(ref.current, options);

export default function Editor({ schema, endpoint, setQuery }) {
  /* STATE AND REFS */
  // setting up refs to DOM nodes, one for each pane (operations, variables, results)
  const opsRef = useRef(null);
  const varsRef = useRef(null);
  const resultsRef = useRef(null);
  // state of each pane's monaco (i believe) instance/interface/api
  const [queryEditor, setQueryEditor] = useState(null);
  const [variablesEditor, setVariablesEditor] = useState(null);
  const [resultsViewer, setResultsViewer] = useState(null);
  // state for monacoEditorOptions.  initialized using settings from defaultEditorOptions.js
  const [editorOptions, setEditorOptions] = useState(defaultEditorOptions);

  const [MonacoGQLAPI, setMonacoGQLAPI] = useState(null);
  const fetcher = endpoint
    ? createGraphiQLFetcher({
        url: endpoint,
      })
    : null;

  // this function gets called when the user hits cmd + enter to run the operation they typed
  const execOperation = async function () {
    // grab the code from the variables pane
    const variables = editor.getModel(Uri.file("variables.json")).getValue();
    // grab the operations from the operations pane
    const operations = editor
      .getModel(Uri.file("operation.graphql"))
      .getValue();
    if (!validateBrackets(operations)) {
      alert("Invalid brackets");
      // refactor later with better overall error handling when we decide the route to take
      // obviously we don't want to alert, but simply show a message in the appropriate place
      return;
    }
    // update active ID's
    setQuery(operations);
    // create reference to the results pane
    const resultsModel = editor.getModel(Uri.file("results.json"));

    if (!fetcher) return;
    // make GQL request with given operations, passing in the variables
    const result = await fetcher({
      query: operations,
      variables: JSON.stringify(JSONC.parse(variables)),
    });
    // Note: this app only supports a single iteration for http GET/POST,
    // no multipart or subscriptions yet.
    const data = await result.next();

    // display the results in results pane
    resultsModel?.setValue(JSON.stringify(data.value, null, 2));
  };

  // this is the 'run operation' action which is bound to cmd+enter
  // execOperation function will be called
  const queryAction = {
    id: "graphql-run",
    label: "Run Operation",
    contextMenuOrder: 0,
    contextMenuGroupId: "graphql",
    keybindings: [
      // eslint-disable-next-line no-bitwise
      KeyMod.CtrlCmd | KeyCode.Enter,
    ],
    run: execOperation,
  };

  // Copies the ENTIRE contents of an editor field (based on it's uri.file)
  async function copyEditorField(ref) {
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
      console.log("Editor contents copied to clipboard");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  function toggleMinimap() {
    return setEditorOptions({
      ...editorOptions,
      enableMiniMap: !editorOptions.enableMiniMap,
    });
  }

  /**
   * Create the models & editors
   * Models represent the 'files' loaded in each editor
   * Editors are the actual editor instances
   */
  useEffect(() => {
    const queryModel = getOrCreateModel("operation.graphql", defaultOperations);
    const variablesModel = getOrCreateModel("variables.json", defaultVariables);
    const resultsModel = getOrCreateModel("results.json", "{}");

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
          minimap: { enabled: enableMiniMap },
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
          minimap: { enabled: enableMiniMap },
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
          minimap: { enabled: enableMiniMap },
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

    /*
    Debouncing is a programming pattern or a technique to restrict the calling of a time-consuming function frequently, by delaying the execution of the function until a specified time to avoid unnecessary CPU cycles, and API calls and improve performance.
    Defining our own debounce in debounce.js (imported)
    Goal: Only refresh the local storage values of queries and variables 300ms after user stops typing
    instead of immediately after each keypress
    */

    queryModel.onDidChangeContent(
      debounce(300, () => {
        const markers = editor.getModelMarkers({
          resource: Uri.file("operation.graphql"),
        });
        if (!markers.length) {
          const query = editor
            .getModel(Uri.file("operation.graphql"))
            .getValue();
          setQuery(query);
          execOperation();
        }
        localStorage.setItem("operations", queryModel.getValue());
      })
    );
    variablesModel.onDidChangeContent(
      debounce(300, () => {
        localStorage.setItem("variables", variablesModel.getValue());
      })
    );

    // only run once on mount
  }, [editorOptions]);

  // Actions execute functionality based on events (in this case it's keybindings)
  // Wait until variables editor is actually instantiated before adding these keybindings
  useEffect(() => {
    queryEditor?.addAction(queryAction);
    variablesEditor?.addAction(queryAction);
  }, [variablesEditor]);

  /**
   * Handle the initial schema load
   */
  useEffect(() => {
    if (schema) initMonacoAPI();
  }, [schema]);

  const initMonacoAPI = () => {
    // set up a way to interface with the monacoGQL api
    // configure settings
    setMonacoGQLAPI(
      initializeMode({
        // match the request pane with variables pane for validation
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
            introspectionJSON: schema, // this is all we're currently using
            uri: "myschema.graphql", // if such a file exists (you can load multiple schemas)
          },
        ],
      })
    );
  };

  // RETURN THAT INCLUDES <SPLIT>
  return (
    <Split
      className="monaco-container"
      sizes={[45, 10, 45]}
      minSize={100}
      direction="vertical"
      dragInterval={10}
    >
      <section className="editor-pane">
        <div ref={opsRef} className="editor" />
        <button className="copy-btn" onClick={() => copyEditorField(opsRef)}>
          copy
        </button>
        <button className="submit-btn">submit query (not hooked up)</button>
      </section>
      <section className="editor-pane">
        <div ref={varsRef} className="editor vars-editor" />
        <button className="copy-btn" onClick={() => copyEditorField(varsRef)}>
          copy
        </button>
      </section>
      <section className="editor-pane">
        <div ref={resultsRef} className="editor" />
        <button
          className="copy-btn"
          onClick={() => copyEditorField(resultsRef)}
        >
          copy
        </button>
      </section>
    </Split>
  );
}

// PRE-SLIDING EDITOR PANELS
//   return (
//     <div className="monaco-container">
//       <section className="editor-pane">
//         <article>
//           <p>Queries</p>
//           <button onClick={() => alert("query info on click")}>?</button>
//           <label>
//             <input
//               type="checkbox"
//               onChange={toggleMinimap}
//               checked={editorOptions.enableMiniMap}
//             ></input>
//             minimap
//           </label>
//         </article>
//         <article className="editor-container query-editor">
//           <div ref={opsRef} className="editor" />
//           <button className="copy-btn" onClick={() => copyEditorField(opsRef)}>
//             copy
//           </button>
//           <button className="submit-btn">submit query (not hooked up)</button>
//         </article>
//         <article className="editor-container variables-editor">
//           <div ref={varsRef} className="editor vars-editor" />
//           <button className="copy-btn" onClick={() => copyEditorField(varsRef)}>
//             copy
//           </button>
//         </article>
//         <article className="editor-container results-editor">
//           <div ref={resultsRef} className="editor" />
//           <button
//             className="copy-btn"
//             onClick={() => copyEditorField(resultsRef)}
//           >
//             copy
//           </button>
//         </article>
//       </section>
//     </div>
//   );
// }
