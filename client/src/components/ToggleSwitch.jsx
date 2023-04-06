import "../styles/ToggleSwitch.css";
import ReverseContext from "../context/ReverseContext";
import { useContext } from "react";
import Tooltip from "@mui/material/Tooltip";
import ConditionalWrapper from "./ConditionalWrapper";

const alwaysToggledInReverse = {
  "active only": true,
  "ghost mode": true,
};

export function ToggleSwitch({
  toggleName,
  labelLeft,
  labelRight,
  handleChange,
  isChecked,
  disabled,
}) {
  const { reverseMode } = useContext(ReverseContext);
  const isAlwaysToggled = reverseMode && toggleName in alwaysToggledInReverse;

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
          condition={isAlwaysToggled}
          wrapper={(children) => (
            <Tooltip title="Always on in reverse mode">{children}</Tooltip>
          )}
        >
          <label className="toggle-switch__switch">
            <input
              type="checkbox"
              disabled={disabled || isAlwaysToggled}
              checked={isAlwaysToggled ? true : isChecked}
              onChange={(e) => handleChange(e)}
            />
            <span className="toggle-slider round"></span>
          </label>
        </ConditionalWrapper>
        <p className="toggle-switch__label-right">{labelRight}</p>
      </div>
    </div>
  );
}
