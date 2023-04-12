import React, { useContext, useRef, useState } from "react";
import { getIntrospectionQuery } from "graphql";
import { request } from "graphql-request";
import parseReceivedSchema from "../utils/parseIntrospectionQueryResponse";
import "../styles/Endpoint.css";
import ReverseContext from "../context/ReverseContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const DEFAULT_ENDPOINT = "https://countries.trevorblades.com/";

export const Endpoint = ({
  endpoint,
  setEndpoint,
  setSchema,
  setVSchema,
  updateMetrics,
}) => {
  /************************************************** State ***********************************************************/

  const epInputRef = useRef();
  const [endpointText, setEndpointText] = useState(DEFAULT_ENDPOINT);
  const { resetReverseContext } = useContext(ReverseContext);
  const [endpointError, setEndpointError] = useState("");

  /************************************************** Helper Functions ************************************************/

  /* Note, 'schema' refers to the actual GQL schema
     whereas 'vSchema' refers to our custom parsed schema
     shape fine-tuned & simplified for visualization */
  const setEPAndFetchSchema = async () => {
    if (endpointText === "")
      return setEndpointError("Please enter an endpoint");
    try {
      // fetch schema from endpoint via Introspection Query
      const schema = await request(endpointText, getIntrospectionQuery());
      setEndpoint(endpointText);
      setSchema(schema);
      // parse schema for use by visualizer
      const parsedSchemaData = parseReceivedSchema(schema);
      setVSchema(parsedSchemaData.visualizerSchema);
      resetReverseContext();
      updateMetrics();
    } catch (e) {
      setEndpointError("Error fetching from this endpoint");
    }
  };

  // helper function to dynamically render button name
  const getEndpointButtonName = () => {
    if (!endpoint) return "Set";
    else if (endpoint === endpointText) return "Refresh";
    else return "Change";
  };

  /************************************************** Render ***********************************************************/

  return (
    <div className="endpoint__container">
      <label htmlFor="endpoint-input" className="endpoint__label"></label>
      <input
        type="text"
        ref={epInputRef}
        id="endpoint-input"
        className="endpoint__input"
        placeholder="GraphQL Endpoint..."
        value={endpointText}
        onChange={(e) => setEndpointText(e.target.value.trim())}
      ></input>
      <button onClick={setEPAndFetchSchema} className="endpoint__button">
        {`${getEndpointButtonName()} Endpoint`}
      </button>
      <Snackbar
        open={endpointError !== ""}
        autoHideDuration={1700}
        onClose={() => setEndpointError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          {endpointError}
        </Alert>
      </Snackbar>
    </div>
  );
};
