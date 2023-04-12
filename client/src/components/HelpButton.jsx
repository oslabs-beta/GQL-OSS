import React from "react";
import "../styles/HelpButton.css";
import { Tooltip } from "@mui/material";
import { GithubSVG } from "./GithubSVG";

// Rotating Help / Github button for toolbar
export const HelpButton = () => {
  return (
    <Tooltip title="Readme">
      <section className="help-button__container">
        <a href="https://github.com/oslabs-beta/GQL-OSS" target="blank">
          <div className="help-button">
            <div className="sideA">?</div>
            <div className="sideB">
              <GithubSVG />
            </div>
          </div>
        </a>
      </section>
    </Tooltip>
  );
};
