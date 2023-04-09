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
  // console.log("source types: ", relationships);
  const { setRevClickedField } = useContext(ReverseContext);
  console.log("here");
  const [source, setSource] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const menuItems = relationships.map((relationship) => {
    return (
      <MenuItem
        key={`${relationship.field}/${relationship.type}`}
        value={`${relationship.field}/${relationship.type}`}
      >
        {`${relationship.type}/${relationship.field}`}
      </MenuItem>
    );
  });
  const handleClose = (event, reason) => {
    if ((reason && reason === "backdropClick") || source === null) {
      setSnackbarOpen(true);
      return;
    }
    console.log("source type: ", source);
    // fieldInfo.typeName = sourceType;
    console.log("field info: ", fieldInfo);
    console.log("revclickedfield: ", setRevClickedField);
    setRevClickedField({
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
          autoHideDuration={2000}
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
