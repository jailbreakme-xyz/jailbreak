import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { ImCross } from "react-icons/im";
import { useNavigate } from "react-router-dom";

const LaunchOption = ({ title, description, onClick, disabled = false }) => (
  <Box
    onClick={!disabled ? onClick : undefined}
    className={disabled ? "disabled" : "pointer"}
    sx={{
      padding: "20px",
      borderRadius: "15px",
      backgroundColor: "rgba(11, 191, 153, 0.1)",
      border: "1px solid #0BBF99",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: !disabled && "rgba(11, 191, 153, 0.2)",
        transform: !disabled && "translateY(-2px)",
      },
      mb: 2,
    }}
  >
    <h3
      className={disabled ? "disabled" : "pointer"}
      style={{
        color: "#0BBF99",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "2px 0px",
      }}
    >
      {title}{" "}
      {disabled && <span style={{ marginLeft: "8px" }}>(Coming Soon)</span>}
    </h3>
    <p
      className={disabled ? "disabled" : "pointer"}
      style={{
        color: "#fff",
        opacity: 0.8,
        textAlign: "center",
        margin: "2px 0px",
      }}
    >
      {description}
    </p>
  </Box>
);

const LaunchOptionsModal = ({
  open,
  onClose,
  setQuickCreationOpen,
  setAdvancedModalOpen,
  setAPICreationOpen,
  setPromptCreationOpen,
}) => {
  const navigate = useNavigate();

  const options = [
    {
      title: "💬 Prompt Launch",
      description: "Launch with a single prompt",
      onClick: () => {
        onClose();
        setPromptCreationOpen(true);
      },
    },
    {
      title: "🚀 Quick Launch",
      description: "Secret Phrase Only",
      onClick: () => {
        onClose();
        setQuickCreationOpen(true);
      },
    },
    {
      title: "⚙️ Advanced Creation",
      description: "Multiple Secrets/Functions",
      onClick: () => {
        onClose();
        setAdvancedModalOpen(true);
      },
    },
    {
      title: "🔌 API Integration",
      description: "Custom Agent",
      onClick: () => {
        onClose();
        setAPICreationOpen(true);
      },
    },
    {
      title: "🤖 Eliza Character",
      description: "Create an agent based on the Eliza architecture",
      disabled: true,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      sx={{ zIndex: "999999999999999" }}
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "#000000",
          borderRadius: "20px",
          border: "2px solid #0BBF99",
        },
      }}
    >
      <DialogContent sx={{ position: "relative", p: 3 }}>
        <IconButton
          className="pointer"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            color: "#0BBF99",
          }}
        >
          <ImCross size={16} />
        </IconButton>

        <h2 style={{ color: "#0BBF99", mb: 3, mt: 1, textAlign: "center" }}>
          Create an Agent
        </h2>

        {options.map((option, index) => (
          <LaunchOption key={index} {...option} />
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default LaunchOptionsModal;
