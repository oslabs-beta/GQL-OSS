import React, { useEffect, useState, useRef} from 'react';
import { Uri, editor, KeyMod, KeyCode, languages } from 'monaco-editor';
import { initializeMode } from 'monaco-graphql/esm/initializeMode';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import * as JSONC from 'jsonc-parser';
import { debounce } from '../utils/debounce';
import validateBrackets from '../utils/validateBrackets';
import { defaultEditorOptions } from "../utils/defaultEditorOptions";
import Split from "react-split";
import "../styles/Editor.css";

/* Default Initial Display for Query Operations */
const defaultOperations =
  localStorage.getItem('operations') ??
  `
# GQL Request Pane
# cmd/ctrl + return/enter will execute the operation
# Also available via context menu & f1 command palette

query {

}
`;

/* Default Initial Display for Variables */
const defaultVariables =
  localStorage.getItem('variables') ??
  `
/* Variables Pane
cmd/ctrl + return/enter will execute the operation
Format your variables as valid JSON */

{

}
`;

/* Get Model at URI, or Create One at URI with Given Value */
const getOrCreateModel = (uri, value,) => {
  return (
    editor.getModel(Uri.file(uri)) ??
    editor.createModel(value, uri.split('.').pop(), Uri.file(uri))
  );
};

/* Config: Set this early on so that initial variables with comments don't flash an error */
languages.json.jsonDefaults.setDiagnosticsOptions({
  allowComments: true,
  trailingCommas: 'ignore',
});

/* Add Editor to DOM Via its Ref */
const createEditor = (ref, options) => editor.create(ref.current, options);

/** EDITOR COMPONENT **/

export default function Editor({schema, endpoint, setQuery}) {

  /********************************************** State & Refs *************************************************/

  const opsRef = useRef(null);
  const varsRef = useRef(null);
  const resultsRef = useRef(null);

  const [queryEditor, setQueryEditor] = useState(null);
  const [variablesEditor, setVariablesEditor] = useState(null);
  const [resultsViewer, setResultsViewer] = useState(null);

  const [editorOptions, setEditorOptions] = useState(defaultEditorOptions);

  const [MonacoGQLAPI, setMonacoGQLAPI] = useState(null);
  // TODO: don't reassign fetcher upon every render
  const fetcher = endpoint ? createGraphiQLFetcher({
    url: endpoint
  }) : null;

  // Need always accurate reference to schema for listeners and callbacks
  const currentSchema = useRef(schema);

  /********************************************** useEFfect's *************************************************/

  /* Update Current Schema Ref for Callbacks and Listeners */
  useEffect(() => {
    currentSchema.current = schema;
  }, [schema]);

  /* Instantiate: Once on Mount */
  /* Create the Models & Editors */
  /* Assign Listeners */
    // Models represent the 'virtual files' loaded in each editor
    // Editors are the actual editor instances
  useEffect(() => {
    const queryModel = getOrCreateModel('operation.graphql', defaultOperations);
    const variablesModel = getOrCreateModel('variables.json', defaultVariables);
    const resultsModel = getOrCreateModel('results.json', '{}');

    // apply editorOptions to the editors as they're created
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
    // Assign Change Listeners
    // Debounce to wait 300ms after user stops typing before executing
    // Ref used here for non-stale state
    queryModel.onDidChangeContent(
      debounce(300, () => {
        if (!currentSchema.current) return;
        const markers = editor.getModelMarkers({resource: Uri.file('operation.graphql')});
        if (!markers.length) {
          const query = editor.getModel(Uri.file('operation.graphql')).getValue();
           if (!validateBrackets(query) || query.trim() === '') return;
          setQuery({queryString: query});
          execOperation();
        }
        localStorage.setItem('operations', queryModel.getValue());
      })
    );
    variablesModel.onDidChangeContent(
      debounce(300, () => {
        localStorage.setItem('variables', variablesModel.getValue());
      })
    );
    initMonacoAPI();
  }, []);

  /* Assign Keybindings */
  // Wait until editors are actually instantiated before assigning
  useEffect(() => {
    queryEditor?.addAction(queryAction);
    variablesEditor?.addAction(queryAction);
  }, [variablesEditor]);

  /* Update Schema Configuration */
  useEffect(() => {
    MonacoGQLAPI?.setSchemaConfig([{ introspectionJSON: schema }]);
  }, [schema]);

  /****************************************** Helper Functions ********************************************/

    /* Execute Current Operation in Query Pane (cmd + enter OR auto) */
  const execOperation = async function () {
    if (!currentSchema.current) {
      alert('Please load a valid schema'); // TODO: refactor error handling
      return;
    }
    const markers = editor.getModelMarkers({resource: Uri.file('operation.graphql')});
    if (markers.length) {
      alert('Syntax error :)'); // TODO: refactor error handling
      return;
    }
    // Grab the code from the variables pane
    const variables = editor.getModel(Uri.file('variables.json')).getValue();
    // Grab the operations from the operations pane
    const operations = editor.getModel(Uri.file('operation.graphql')).getValue();
    if (!validateBrackets(operations)) {
      alert('Invalid brackets'); // TODO: refactor error handling
      return;
    };
    if (operations.trim() === '') {
      alert('Empty query'); // TODO: refactor error handling
      return;
    }
    // Update query state at top level in order to update active ID's
    // Note, this went from string -> object for strict equality reasons (Always catch new instance)
    setQuery({queryString: operations});
    // Create reference to the results pane
    const resultsModel = editor.getModel(Uri.file('results.json'));
    if (!fetcher) return;
    // Make GQL request with given operations, passing in the variables
    const result = await fetcher({
      query: operations,
      variables: JSON.stringify(JSONC.parse(variables)),
    });
    // Note: this app only supports a single iteration for http GET/POST,
    // no multipart or subscriptions yet.
    const data = await result.next();

    // Display the results in results pane
    resultsModel?.setValue(JSON.stringify(data.value, null, 2));
  };

 /* Keyboard Action For Executing Operation (cmd + enter) */
  const queryAction = {
    id: 'graphql-run',
    label: 'Run Operation',
    contextMenuOrder: 0,
    contextMenuGroupId: 'graphql',
    keybindings: [
      // eslint-disable-next-line no-bitwise
      KeyMod.CtrlCmd | KeyCode.Enter,
    ],
    run: execOperation,
  };

  /* Configure Monaco API & Connect to GraphQL Validation */
  const initMonacoAPI = () => {
    setMonacoGQLAPI(initializeMode({
      // Pair request pane with variables pane for validation
      diagnosticSettings: {
        validateVariablesJSON: {
          [Uri.file('operation.graphql').toString()]: [
            Uri.file('variables.json').toString(),
          ],
        },
        jsonDiagnosticSettings: {
          validate: true,
          schemaValidation: 'error',
          // set these again, because we are entirely re-setting them here
          allowComments: true,
          trailingCommas: 'ignore',
        },
      },
      schemas: [
        {
          introspectionJSON: currentSchema.current,
          // uri: 'myschema.graphql', // You can have multiple schemas if you want
        },
      ],
    }));
  }

  /* Copy the Editor Contents */
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

  /* Toggle Editor Minimap */
  function toggleMinimap() {
    return setEditorOptions({
      ...editorOptions,
      enableMiniMap: !editorOptions.enableMiniMap,
    });
  }

  /************************************************ Render ******************************************************/

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