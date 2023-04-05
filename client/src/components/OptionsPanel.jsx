import { useState, useEffect } from "react";
import { Panel } from "reactflow";
import "../styles/OptionsPanel.css";
import { ToggleSwitch } from "./ToggleSwitch";
import { ColorPicker } from "./ColorPicker";
import { motion } from "framer-motion";
import { Pushbutton } from "./Pushbutton";

export function OptionsPanel({
  visualizerOptions,
  toggleTargetPosition,
  displayMode,
  toggleDisplayMode,
  toggleMinimap,
  toggleControls,
  customColors,
  setCustomColors,
  ghostMode,
  toggleGhostMode,
  collapseAll,
  expandAll,
}) {
  const { targetPosition, showMinimap, showControls } = visualizerOptions;

  const [collapsed, setCollapsed] = useState(false);
  // const [rotateIcon, setRotateIcon] = useState(false)
  // useEffect(() => console.log('CUSTOMCOLORS::::::: ',customColors['nodeHighlight']), [])
  return (
    <>
      <Panel position="top-right" className="options-panel__container">
        <h4 className="options-panel__header">
          <button
            className="options-panel__expand-button"
            onClick={() => setCollapsed(!collapsed)}
          >
            Display Options{" "}
            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              id="options-panel__rotating-button"
            >
              {"\u25be"}
            </motion.div>
          </button>
        </h4>
        {!collapsed && <hr className="options-panel__hr" />}
        {!collapsed && (
          <div>
            <ToggleSwitch
              toggleName="target Position"
              labelLeft="left"
              labelRight="top"
              isChecked={targetPosition === "top"}
              handleChange={toggleTargetPosition}
            />
            
            <ToggleSwitch
              toggleName="show minimap"
              labelLeft="off"
              labelRight="on"
              isChecked={showMinimap}
              handleChange={toggleMinimap}
            />
            <ToggleSwitch
              toggleName="show controls"
              labelLeft="off"
              labelRight="on"
              isChecked={showControls}
              handleChange={toggleControls}
            />

            {/* <ColorPicker
              pickerName="Node Highlight"
              handleChange={setCustomColors}
              target='nodeHighlight'
              defaultColor={customColors}
            /> */}
            <ColorPicker
              pickerName="Field Highlight"
              handleChange={setCustomColors}
              target="fieldHighlight"
              defaultColor={customColors}
            />
            <ColorPicker
              pickerName="Edge Default"
              handleChange={setCustomColors}
              target="edgeDefault"
              defaultColor={customColors}
            />
            <ColorPicker
              pickerName="Edge Highlight"
              handleChange={setCustomColors}
              target="edgeHighlight"
              defaultColor={customColors}
            />
            <Pushbutton
              buttonText="Expand All"
              handleClick={expandAll}
            />
            <Pushbutton
              buttonText="Collapse All"
              handleClick={collapseAll}
            />
            <ToggleSwitch
              toggleName="Active Only"
              labelLeft="Off"
              labelRight="On"
              isChecked={displayMode === "activeOnly"}
              handleChange={toggleDisplayMode}
            />
            {displayMode === "activeOnly" &&
            <ToggleSwitch
              toggleName="Ghost Mode"
              labelLeft="off"
              labelRight="on"
              isChecked={ghostMode === "on"}
              handleChange={toggleGhostMode}
            />}
          </div>
        )}
      </Panel>
    </>
  );
}
