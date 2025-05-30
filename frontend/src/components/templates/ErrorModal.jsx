import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import { ImCross } from "react-icons/im";
import { FaSadCry } from "react-icons/fa";

export default function ErrorModal({ errorModalOpen, setErrorModalOpen }) {
  return (
    <Dialog
      open={errorModalOpen}
      sx={{ zIndex: "999999999999999" }}
      PaperProps={{
        style: {
          backgroundColor: "#000000",
          color: "#fe3448",
          padding: "10px",
          borderRadius: "20px",
          border: "2px solid #fe3448",
          minWidth: "300px",
          textAlign: "center",
          position: "absolute",
          bottom: "10px",
          right: "20px",
          width: "100px",
        },
      }}
    >
      <DialogContent sx={{ position: "relative" }}>
        <IconButton
          className="close pointer"
          onClick={() => setErrorModalOpen(false)}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            color: "#fe3448",
          }}
        >
          <ImCross size={16} />
        </IconButton>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <FaSadCry size={50} />
          <div style={{ fontSize: "18px", fontWeight: "bold" }}>
            {errorModalOpen}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
