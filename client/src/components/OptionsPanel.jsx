import ReactFlow, { Panel } from "reactflow";
import "../styles/OptionsPanel.css";

export function OptionsPanel({ visualizerOptions, toggleTargetPosition }) {
  const { targetPosition } = visualizerOptions;

  return (
    <>
      <Panel position="top-left" className="options-panel__container">
        <p className="options-panel__name">target position:</p>
        <input
          type="radio"
          id="target-left"
          name="targetPosition"
          value="left"
          className="options-panel__radio-button"
          checked={targetPosition === "left"}
          onChange={(e) => toggleTargetPosition(e.target.value)}
        ></input>
        <label htmlFor="target-left" className="options-panel__label">
          Left
        </label>
        <input
          type="radio"
          id="target-top"
          name="targetPosition"
          value="top"
          className="options-panel__radio-button"
          checked={targetPosition === "top"}
          onChange={(e) => toggleTargetPosition(e.target.value)}
        ></input>
        <label htmlFor="target-top" className="options-panel__label">
          Top
        </label>
      </Panel>
    </>
  );
}
