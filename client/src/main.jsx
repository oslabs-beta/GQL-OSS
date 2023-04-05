import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ReactFlowProvider } from "reactflow";
import { ContextProvider } from "./context/ReverseContext";
import "./styles/main.css";

ReactDOM.render(
  <React.StrictMode>
    <ReactFlowProvider>
      <ContextProvider>
        <App />
      </ContextProvider>
    </ReactFlowProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
