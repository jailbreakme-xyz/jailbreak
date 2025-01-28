import React from "react";
import { Dialog, DialogContent, Box, Typography, Button } from "@mui/material";
import { FaCheckCircle } from "react-icons/fa";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const SuccessModal = ({
  open,
  message = "Agent created successfully!",
  agent,
}) => {
  return (
    <Dialog
      open={open}
      sx={{
        "& .MuiDialog-paper": {
          margin: "20px",
          backgroundColor: "transparent",
          boxShadow: "none",
          overflow: "visible",
        },
        zIndex: "100000000000000000000000000000000000001",
      }}
    >
      <DialogContent
        sx={{
          backgroundColor: "#000000",
          border: "2px solid #0BBF99",
          borderRadius: "20px",
          padding: "30px !important",
          minWidth: { xs: "280px", sm: "320px" },
          animation: `${fadeIn} 0.3s ease-out`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(11, 191, 153, 0.1)",
            borderRadius: "50%",
            padding: "15px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FaCheckCircle
            size={50}
            color="#0BBF99"
            style={{
              animation: `${fadeIn} 0.5s ease-out`,
            }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: "#0BBF99",
            textAlign: "center",
            fontWeight: "bold",
            animation: `${fadeIn} 0.5s ease-out`,
          }}
        >
          Success!
        </Typography>
        <Typography
          sx={{
            color: "#fff",
            textAlign: "center",
            opacity: 0.9,
            animation: `${fadeIn} 0.5s ease-out`,
          }}
        >
          {message}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.open(`/break/${agent?.name}`, "_blank")}
          sx={{ color: "#000000", backgroundColor: "#0BBF99" }}
        >
          View Agent
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
