import "../styles/ColorPicker.css";
import {useState} from 'react'

export function ColorPicker({
  pickerName,
  handleChange,
  isChecked,
  defaultColor,
  target
}) {
  const [color, setColor] = useState(defaultColor)
  return (
    <div className="color-picker">
      <p className="color-picker__name">{pickerName}</p>
      <div className="color-picker__container">
          <input
            value={defaultColor[target]}
            className="color-input"
            type="color"
            checked={isChecked}
            onChange={e => {
              setColor(e.target.value)
              handleChange(e.target.value, target)
            }}
          />        
      </div>
    </div>
  );
}
