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
      <h3>State:</h3>
      <p><strong>endpointText (in EndpointInput component): </strong>{endpointText}</p>
      <p><strong>endpoint (in App component): </strong>{endpoint}</p>
    </div>
  )
}