import "../styles/ToggleSwitch.css";
import ReverseContext from "../context/ReverseContext";
import { useContext } from "react";
import Tooltip from "@mui/material/Tooltip";
import ConditionalWrapper from "./ConditionalWrapper";

const alwaysToggledInReverse = {
  "active only": true,
  suggestions: true,
};
const alwaysOffWhileDisplayAll = {
  suggestions: true,
};

export function ToggleSwitch({
  toggleName,
  labelLeft,
  labelRight,
  handleChange,
  isChecked,
  disabled,
  displayMode,
  id,
}) {
  const { reverseMode } = useContext(ReverseContext);
  const isAlwaysToggled =
    reverseMode &&
    (toggleName in alwaysToggledInReverse || id === "liveQueryToggle");
  const isAlwaysOff =
    displayMode === "all" && toggleName in alwaysOffWhileDisplayAll;
  let tooltipMessage;
  if (isAlwaysToggled) tooltipMessage = "Always on in reverse mode";
  else if (isAlwaysOff) tooltipMessage = "Active Only must be on";
  if (toggleName === "Reverse Mode")
    tooltipMessage = "Turning this on will reset your data!";
  //TODO: refactor tooltips and toggle switch conditions into a more universally consolidated DRY framework

  return (
    <div className="toggle-switch">
      <p className="toggle-switch__name">{toggleName}</p>
      <div className="toggle-switch__container">
        <p
          className={`toggle-switch__label-left
        ${isAlwaysToggled ? " unavailable" : ""}`}
        >
          {labelLeft}
        </p>
        <ConditionalWrapper
          condition={tooltipMessage}
          wrapper={(children) => (
            <Tooltip title={tooltipMessage}>{children}</Tooltip>
          )}
        >
          <label className="toggle-switch__switch">
            <input
              type="checkbox"
              disabled={disabled || isAlwaysToggled || isAlwaysOff}
              checked={isAlwaysToggled ? true : isChecked}
              onChange={(e) => handleChange(e)}
            />
            <span className="toggle-slider round"></span>
          </label>
        </ConditionalWrapper>
        <p
          className={`toggle-switch__label-right
        ${isAlwaysOff ? " unavailable" : ""}`}
        >
          {labelRight}
        </p>
      </div>
    </div>
  );
}
