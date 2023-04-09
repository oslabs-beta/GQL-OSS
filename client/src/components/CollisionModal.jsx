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
import "../styles/CollisionModal.css";
import ReverseContext from "../context/ReverseContext";

const CollisionModal = ({ open, setOpen, relationships, fieldInfo }) => {
  /********************************************************* State *********************************************************/

  const { setRevClickedField } = useContext(ReverseContext);
  const [source, setSource] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  /********************************************************* UI Mapping *********************************************************/

  /* Map each reverse relationship of a clicked field with collisions to menu items (dropdown choices) */
  const menuItems = relationships.map((relationship) => {
    return (
      <MenuItem
        key={`${relationship.field}/${relationship.type}`} // The format setup in Reverse Context
        value={`${relationship.field}/${relationship.type}`}
      >
        {`${relationship.type}/${relationship.field}`}
      </MenuItem>
    );
  });

  /********************************************************* Helper Fn's *********************************************************/
  const handleClose = (event, reason) => {
    if ((reason && reason === "backdropClick") || source === null) {
      setSnackbarOpen(true);
      return;
    }
    setRevClickedField({
      // Triggers collision management in Reverse Context
      userClarification: source,
      relationship: fieldInfo.relationship,
      isClarifiedField: true,
      typeName: fieldInfo.typeName,
      fieldName: fieldInfo.fieldName,
    });
    setOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
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
          anchorOrigin={{ vertical: "center", horizontal: "center" }}
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
