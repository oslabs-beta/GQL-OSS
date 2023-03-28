import ReactFlow, { Panel } from "reactflow";
import "../styles/OptionsPanel.css";

export function OptionsPanel({ visualizerOptions, toggleTargetPosition }) {
  const { targetPosition } = visualizerOptions;

  return (
    <>
      <Panel position="top-left" className="options-panel__container">
        <p className="options-panel__name">target position:</p>
        <div className="switch__container">
          <p className="switch__label-left">left</p>
          <label className="switch">
            <input
              type="checkbox"
              checked={targetPosition === "top"}
              onChange={toggleTargetPosition}
            />
            <span className="slider round"></span>
          </label>
          <p className="switch__label-right">top</p>
        </div>
      </Panel>
    </>
  );
}
