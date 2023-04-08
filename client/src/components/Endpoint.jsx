import React, { useRef, useState } from "react";
import { getIntrospectionQuery } from "graphql";
import { request } from "graphql-request";
import parseReceivedSchema from "../utils/parseIntrospectionQueryResponse";
import "../styles/Endpoint.css";
import { calculate_metrics } from "../utils/metrics";

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

  const setEPAndFetchSchema = async () => {
    setEndpoint(endpointText);
    // fetch and parse schema
    const schema = await request(endpointText, getIntrospectionQuery());
    setSchema(schema);
    const parsedSchemaData = parseReceivedSchema(schema);
    setVSchema(parsedSchemaData.visualizerSchema);
    // const newMetrics = calculate_metrics(endpointText);
    // newMetrics.lastResponseType = "Introspection";
    // updateMetrics(newMetrics);
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
    </div>
  );
};
