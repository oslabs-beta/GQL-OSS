import React from "react";
import "../styles/HelpButton.css";
import { Tooltip } from "@mui/material";
import { GithubSVG } from "./GithubSVG";

// Rotating Help / Github button for toolbar
export const HelpButton = ({ type }) => {
  return (
    <Tooltip title={type === "github-hb" ? `Find us on GitHub!` : `Help`}>
      <section className={`help-button__container ${type}`}>
        <a href="https://github.com/oslabs-beta/GQL-OSS" target="blank">
          <div className="help-button">
            <div className="sideA">
              {type === "github-hb" ? <GithubSVG /> : "?"}
            </div>
            <div className="sideB">
              {type === "github-hb" ? <GithubSVG /> : "?"}
            </div>
          </div>
        </a>
      </section>
    </Tooltip>
  );
};
