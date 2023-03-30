import {useState} from "react";
import ReactFlow, { Panel } from "reactflow";
import "../styles/OptionsPanel.css";
import { ToggleSwitch } from "./ToggleSwitch";
import { motion } from "framer-motion"



export function OptionsPanel({ visualizerOptions, toggleTargetPosition }) {
  const { targetPosition } = visualizerOptions;

  const [collapsed, setCollapsed] = useState(false);
  // const [rotateIcon, setRotateIcon] = useState(false)
  


  return (
    <>
      <Panel position="top-right" className="options-panel__container">
        <h4 className="options-panel__header">
          <button className='options-panel__expand-button' onClick={() => setCollapsed(!collapsed)}>
            Display Options <motion.div 
              animate = {{ rotate: collapsed ? 180 : 0}}
              id='options-panel__rotating-button'
              >{'\u25be'}
            </motion.div>
          </button>
        </h4>  
        {!collapsed && <hr className="options-panel__hr" />}
          {!collapsed && <div>
            <ToggleSwitch
              toggleName="target Position"
              labelLeft="left"
              labelRight="top"
              isChecked={targetPosition === "top"}
              handleChange={toggleTargetPosition}
            />
          </div>  
          }
      </Panel>
    </>
  );
}
