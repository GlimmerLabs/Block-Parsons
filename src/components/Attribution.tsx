import { Box, Button, Link, Modal, Typography } from "@mui/material";
import { useState } from "react";
import InfoIcon from "@mui/icons-material/Info";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export function Attribution() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <Button size={"small"} onClick={handleOpen} startIcon={<InfoIcon />}>
        View Attributions
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography
            component={Link}
            href="https://www.flaticon.com/free-icons/squirrel"
            title="squirrel icons"
          >
            Original squirrel icon created by Freepik
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
