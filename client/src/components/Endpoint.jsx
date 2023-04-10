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
  // state for controlled input
  const epInputRef = useRef();
  const [endpointText, setEndpointText] = useState(DEFAULT_ENDPOINT);
  const { resetReverseContext } = useContext(ReverseContext);
  const [endpointError, setEndpointError] = useState("");

  const setEPAndFetchSchema = async () => {
    if (endpointText === "")
      return setEndpointError("Please enter an endpoint");
    // fetch and parse schema
    try {
      const schema = await request(endpointText, getIntrospectionQuery());
      setEndpoint(endpointText);
      setSchema(schema);
      const parsedSchemaData = parseReceivedSchema(schema);
      setVSchema(parsedSchemaData.visualizerSchema);
      resetReverseContext();
      // const newMetrics = calculate_metrics(endpointText);
      // updateMetrics(newMetrics);
      updateMetrics();
    } catch (e) {
      // console.log("Error fetching introspection query: ", e);
      setEndpointError("Error fetching from this endpoint");
    }
  };

  const getEndpointButtonName = () => {
    if (!endpoint) return "Set";
    else if (endpoint === endpointText) return "Refresh";
    else return "Change";
  };

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
        onChange={(e) => setEndpointText(e.target.value)}
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
