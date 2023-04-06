import React, { useRef, useState } from "react";
import { getIntrospectionQuery } from "graphql";
import { request } from "graphql-request";
import parseReceivedSchema from "../utils/parseIntrospectionQueryResponse";
import "../styles/Endpoint.css";
import { calculate_metrics } from "../utils/metrics";

export const Endpoint = ({
  endpoint,
  setEndpoint,
  setSchema,
  setVSchema,
  updateMetrics,
}) => {
  // state for controlled input
  const epInputRef = useRef();
  const [endpointText, setEndpointText] = useState(endpoint);

  const setEPAndFetchSchema = async () => {
    setEndpoint(endpointText);
    // fetch and parse schema
    const schema = await request(endpointText, getIntrospectionQuery());
    setSchema(schema);
    const parsedSchemaData = parseReceivedSchema(schema);
    setVSchema(parsedSchemaData.visualizerSchema);
    const newMetrics = calculate_metrics(endpointText);
    newMetrics.lastResponseType = "Introspection";
    updateMetrics(newMetrics);
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
        Set Endpoint
      </button>
    </div>
  );
};
