import React, { useEffect, useState, useRef} from 'react';
import { Uri, editor, KeyMod, KeyCode, languages } from 'monaco-editor';
import { initializeMode } from 'monaco-graphql/esm/initializeMode';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import * as JSONC from 'jsonc-parser';
import { debounce } from '../utils/debounce';
import validateBrackets from '../utils/validateBrackets';

// description that is displayed in request pane above actual code
// indicate to the user what commands are available and defined
// see below: 'queryAction'
const defaultOperations =
  localStorage.getItem('operations') ??
  `
# GQL Request Pane
# cmd/ctrl + return/enter will execute the operation
# Also available via context menu & f1 command palette

query {

}
`;

// same as above but for the variables pane
const defaultVariables =
  localStorage.getItem('variables') ??
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
const getOrCreateModel = (uri, value,) => {
  return (
    editor.getModel(Uri.file(uri)) ??
    editor.createModel(value, uri.split('.').pop(), Uri.file(uri))
  );
};


// set these early on so that initial variables with comments don't flash an error
// NOTE: This may set up options for the variables being cross checked across the schema
// may need more here
languages.json.jsonDefaults.setDiagnosticsOptions({
  allowComments: true,
  trailingCommas: 'ignore',
});


// add editor to DOM
// ref is the element the editor will hook onto
const createEditor = (
  ref,
  options,
) => editor.create(ref.current, options);


export default function Editor({schema, endpoint, setQuery}) {
  /* STATE AND REFS */
  // setting up refs to DOM nodes, one for each pane (operations, variables, results)
  const opsRef = useRef(null);
  const varsRef = useRef(null);
  const resultsRef = useRef(null);
  // state of each pane's monaco (i believe) instance/interface/api
  const [queryEditor, setQueryEditor] = useState(null);
  const [variablesEditor, setVariablesEditor] = useState(null);
  const [resultsViewer, setResultsViewer] = useState(null);

  const [MonacoGQLAPI, setMonacoGQLAPI] = useState(null);
  const fetcher = endpoint ? createGraphiQLFetcher({
    url: endpoint
  }) : null;

  const currentSchema = useRef(schema);

  useEffect(() => {
    currentSchema.current = schema;
  }, [schema]);


  // this function gets called when the user hits cmd + enter to run the operation they typed
  const execOperation = async function () {
    console.log('currentSchema: ', currentSchema.current);
    if (!currentSchema.current) {
      alert('Please load a valid schema'); // TODO: refactor error handling
      return;
    }
    const markers = editor.getModelMarkers({resource: Uri.file('operation.graphql')});
    console.log('in exec, markers: ', markers);
    if (markers.length) {
      alert('Syntax error :)'); // Refactor later
      return;
    }
    // grab the code from the variables pane
    const variables = editor.getModel(Uri.file('variables.json')).getValue();
    // grab the operations from the operations pane
    const operations = editor.getModel(Uri.file('operation.graphql')).getValue();
    if (!validateBrackets(operations)) {
      alert('Invalid brackets'); // Refactor
      return;
    };
    if (operations.trim() === '') {
      alert('Empty query'); // Refactor
      return;
    }
    // update active ID's
    setQuery({queryString: operations});
    // create reference to the results pane
    const resultsModel = editor.getModel(Uri.file('results.json'));

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

  /**
   * Create the models & editors
   * Models represent the 'files' loaded in each editor
   * Editors are the actual editor instances
   */
  useEffect(() => {
    const queryModel = getOrCreateModel('operation.graphql', defaultOperations);
    const variablesModel = getOrCreateModel('variables.json', defaultVariables);
    const resultsModel = getOrCreateModel('results.json', '{}');

    queryEditor ??
      setQueryEditor(
        createEditor(opsRef, {
          theme: 'vs-dark',
          model: queryModel,
          language: 'graphql',
          automaticLayout: true
        })
      );
    variablesEditor ??
      setVariablesEditor(
        createEditor(varsRef, {
          theme: 'vs-dark',
          model: variablesModel,
          automaticLayout: true
        })
      );
    resultsViewer ??
      setResultsViewer(
        createEditor(resultsRef, {
          theme: 'vs-dark',
          model: resultsModel,
          readOnly: true,
          smoothScrolling: true,
          automaticLayout: true
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
        if (!currentSchema.current) {
          return;
        };
        const markers = editor.getModelMarkers({resource: Uri.file('operation.graphql')});
        console.log('markers: ', markers);
        if (!markers.length) {
          const query = editor.getModel(Uri.file('operation.graphql')).getValue();
           if (!validateBrackets(query)) {
              return;
            };
          if (query.trim() === '') {
            // alert('Empty query');
            return;
          }
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

    // only run once on mount
  }, []);




  // Actions execute functionality based on events (in this case it's keybindings)
  // Wait until variables editor is actually instantiated before adding these keybindings
  useEffect(() => {
    queryEditor?.addAction(queryAction);
    variablesEditor?.addAction(queryAction);
  }, [variablesEditor]);

  /**
   * Handle the initial schema load
   */
  // useEffect(() => {
  //   console.log('here')
  //   if (schema) {
  //     console.log('HERE');
  //     initMonacoAPI();
  //   }
  // }, [schema, currentSchema.current]);

  useEffect(() => {
    // const opModelMode = editor.getModel(Uri.file('operation.graphql')).getMode();
    console.log('schema changed, it is now: ', schema);
    MonacoGQLAPI?.setSchemaConfig([
      {
        introspectionJSON: schema,
      },
  ]);
  }, [schema]);

  const initMonacoAPI = () => {
    // set up a way to interface with the monacoGQL api
    // configure settings
    console.log('initMonacoAPI');
    console.log('currentSchema: ', currentSchema.current);
    setMonacoGQLAPI(initializeMode({
      // match the request pane with variables pane for validation
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
          introspectionJSON: currentSchema.current, // this is all we're currently using
          // uri: 'myschema.graphql', // if such a file exists (you can load multiple schemas)
        },
      ],
    }));
  }

  console.log('in Editor: schema is: ', schema);
  console.log('in Editor: currentSchema is: ', currentSchema.current);
  return (
    <div className="monaco-container">
      <section className="editor-pane">
        <div ref={opsRef} className="editor" />
        <div ref={varsRef} className="editor vars-editor" />
        <div ref={resultsRef} className="editor" />
      </section>
    </div>
  );
}
