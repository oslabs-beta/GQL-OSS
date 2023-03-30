import { Panel } from "reactflow";
import "../styles/OptionsPanel.css";
import { ToggleSwitch } from "./ToggleSwitch";

export function OptionsPanel({ visualizerOptions, toggleTargetPosition, displayMode, toggleDisplayMode }) {
  const { targetPosition } = visualizerOptions;

  return (
    <>
      <Panel position="top-right" className="options-panel__container">
        <h4 className="options-panel__header">Display Options</h4>
        <hr className="options-panel__hr"></hr>
        <ToggleSwitch
          toggleName="target Position"
          labelLeft="left"
          labelRight="top"
          isChecked={targetPosition === "top"}
          handleChange={toggleTargetPosition}
        />
        <ToggleSwitch
          toggleName="Display Mode"
          labelLeft="All"
          labelRight="Active"
          isChecked={displayMode === "activeOnly"}
          handleChange={toggleDisplayMode}
        />

      </Panel>
    </>
  );
}
