import "../styles/Pushbutton.css";

export function Pushbutton({
  buttonText,
  handleClick
}) {
  return(
    <div className="Pushbutton">
      <button onClick={() => {handleClick()}}>{buttonText}</button>
    </div>
  );
}