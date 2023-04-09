import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import "../styles/CollisionModal.css";

const CollisionModal = ({ open, setOpen, sourceTypes }) => {
  console.log("source types: ", sourceTypes);
  const [sourceType, setSourceType] = useState(null);
  const menuItems = sourceTypes.map((type) => {
    return (
      <MenuItem key={type} value={type}>
        {type}
      </MenuItem>
    );
  });
  const handleClose = () => {
    setOpen(false);
  };
  const handleSourceTypeChange = (event) => {
    setSourceType(event.target.value);
  };

  return (
    <div className="collision-modal-container">
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Collision Detected</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Multiple active routes lead to this field. Choose the source Type
            you'd like.
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
            <FormControl sx={{ mt: 2, minWidth: 120 }}>
              <InputLabel htmlFor="source-type-select">Source Type</InputLabel>
              <Select
                autoFocus
                value={sourceType}
                onChange={handleSourceTypeChange}
                label="source-type-select"
                inputProps={{
                  name: "source-type-select",
                  id: "source-type-select",
                }}
              >
                {menuItems}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CollisionModal;
