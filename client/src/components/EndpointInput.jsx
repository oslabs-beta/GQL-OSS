import React, { useState } from "react";
import '../styles/EndpointInput.css'

export const EndpointInput = ({endpoint, setEndpoint}) => {
  // state for controlled input
  const [endpointText, setEndpointText] = useState(endpoint);

  // to save the endpoint
  const updateEndpoint = () => setEndpoint(endpointText);

  return (
    <div className="endpoint-input">
      <label htmlFor='endpoint-input'>GraphQL Server Endpoint:</label>
      <input
        type='text'
        id='endpoint-input'
        placeholder="GraphQL Endpoint..."
        value={endpointText}
        onChange={(e) => setEndpointText(e.target.value)}></input>
      <button onClick={updateEndpoint}>Update Endpoint</button>
    </div>
  )
}