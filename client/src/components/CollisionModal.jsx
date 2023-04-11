import { useState, useContext } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import ReverseContext from "../context/ReverseContext";

/* Collision Modal: a MaterialUI-based modal for selecting which specific active route to place a clicked field in reverse mode */
const CollisionModal = ({ open, setOpen, relationships, fieldInfo }) => {
  /********************************************************* State **************************************************************/

  const { setRevClickedField } = useContext(ReverseContext);
  const [source, setSource] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  /********************************************************* UI Mapping *********************************************************/

  /* Map each reverse relationship of a clicked field with collisions to menu items (dropdown choices) */
  const menuItems = relationships.map((relationship) => {
    const sanitizedField = relationship.field.replaceAll(/\([^)]*\)/g, ""); // Don't display variables (anything inside parens) to user
    return (
      <MenuItem
        key={`${relationship.field}/${relationship.type}`} // The format setup in Reverse Context (inverse is shown to user for readability)
        value={`${relationship.field}/${relationship.type}`}
      >
        {`${relationship.type}/${sanitizedField}`}
      </MenuItem>
    );
  });

  /********************************************************* Helper Fn's *********************************************************/

  const handleClose = (event, reason) => {
    if ((reason && reason === "backdropClick") || source === "") {
      setSnackbarOpen(true); // Force user to select option
      // Ideally do not force. However, the reverse mode framework currently requires a selection.
      return;
    }
    setRevClickedField({
      // This object shape triggers collision management in Reverse Context
      userClarification: source,
      relationship: fieldInfo.relationship,
      isClarifiedField: true,
      typeName: fieldInfo.typeName,
      fieldName: fieldInfo.fieldName,
    });
    setOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSourceChange = (event) => {
    setSource(event.target.value);
  };

  /********************************************************* Render *********************************************************/

  return (
    <div className="collision-modal-container">
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Collision Detected</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Multiple active routes lead to this field. Which source would you
            like to add it to?
          </DialogContentText>
          <Box
            noValidate
            component="form"
            sx={{
              display: "flex",
              flexDirection: "column",
              m: "auto",
              width: "fit-content",
            }}
          >
            <FormControl sx={{ mt: 2, minWidth: 140 }}>
              <InputLabel htmlFor="source-select">Source</InputLabel>
              <Select
                autoFocus
                value={source}
                onChange={handleSourceChange}
                label="source-select"
                inputProps={{
                  name: "source-select",
                  id: "source-select",
                }}
              >
                {menuItems}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Select</Button>
        </DialogActions>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={1700}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="warning" sx={{ width: "100%" }}>
            Please select an option
          </Alert>
        </Snackbar>
      </Dialog>
    </div>
  );
};

export default CollisionModal;
