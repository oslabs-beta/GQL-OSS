import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ReactFlowProvider } from "reactflow";
import { ContextProvider } from "./context/ReverseContext";
import "./styles/main.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

/* MUI dark palette */
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

ReactDOM.render(
  <React.StrictMode>
    <ReactFlowProvider>
      <ContextProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </ContextProvider>
    </ReactFlowProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
