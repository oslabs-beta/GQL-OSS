import React, { useState } from "react";
import { getIntrospectionQuery } from 'graphql';
import { request } from 'graphql-request';
import parseReceivedSchema from '../utils/parseIntrospectionQueryResponse';
import '../styles/Endpoint.css'

export const Endpoint = ({endpoint, setEndpoint, setSchema, setVSchema}) => {
  // state for controlled input
  const [endpointText, setEndpointText] = useState(endpoint);

  const setEPAndFetchSchema = async () => {
    setEndpoint(endpointText)
    
    // fetch and parse schema
    const schema = await request(endpoint, getIntrospectionQuery());
    setSchema(schema);
    const parsedSchemaData = parseReceivedSchema(schema);
    setVSchema(parsedSchemaData.visualizerSchema);
  }

  return (
    <div className="endpoint-input__container">
      <label htmlFor='endpoint-input'>GraphQL Server Endpoint:</label>
      <input
        type='text'
        id='endpoint-input'
        placeholder="GraphQL Endpoint..."
        value={endpointText}
        onChange={(e) => setEndpointText(e.target.value)}></input>
      <button onClick={setEPAndFetchSchema}>Set Endpoint</button>
    </div>
  )
}