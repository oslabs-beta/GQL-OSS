import React from "react";
import ReactDOM from "react-dom";
import "./styles/main.css";
import App from "./App";
import { ReactFlowProvider } from "reactflow";

ReactDOM.render(
  <React.StrictMode>
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
