import react from "react";
import "../styles/ToggleSwitch.css";

export function ToggleSwitch({
  toggleName,
  labelLeft,
  labelRight,
  handleChange,
  isChecked,
}) {
  return (
    <div className="toggle-switch">
      <p className="toggle-switch__name">{toggleName}</p>
      <div className="toggle-switch__container">
        <p className="toggle-switch__label-left">{labelLeft}</p>
        <label className="toggle-switch__switch">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleChange(e)}
          />
          <span className="toggle-slider round"></span>
        </label>
        <p className="toggle-switch__label-right">{labelRight}</p>
      </div>
    </div>
  );
}
