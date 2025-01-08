import React from "react";
import { Dialog, DialogContent, DialogActions } from "@mui/material";
import Header from "./Header";
import AdvancedCreation from "./AdvancedCreation";
import { ImCross } from "react-icons/im";
import { FaSadCry } from "react-icons/fa";
import IconButton from "@mui/material/IconButton";

export default function AdvancedModal({
  formOpen,
  connected,
  publicKey,
  getDeploymentTransaction,
  handleAdvancedModalClose,
  sample,
  editError,
  setEditError,
  mode,
  isUploading,
}) {
  return (
    <Dialog
      open={formOpen}
      onClose={handleAdvancedModalClose}
      fullScreen
      className="fullWidthPage fullScreenDialog"
    >
      {/* <Header /> */}
      <DialogContent sx={{ p: { xs: 0, md: 2 } }}>
        <AdvancedCreation
          isUploading={isUploading}
          sample={sample}
          handleAdvancedModalClose={handleAdvancedModalClose}
          close={true}
          connected={connected}
          publicKey={publicKey}
          getDeploymentTransaction={getDeploymentTransaction}
          mode={mode}
        />
      </DialogContent>

      <Dialog
        open={editError}
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
            onClick={() => setEditError(null)}
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
              {editError}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
