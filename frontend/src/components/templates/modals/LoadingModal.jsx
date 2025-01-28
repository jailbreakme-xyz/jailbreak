import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  LinearProgress,
  Typography,
} from "@mui/material";
import { RingLoader } from "react-spinners";

const LoadingModal = ({ open, steps, customLabel }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (open) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 100 / (steps.length * 30);
        });
      }, 100);

      steps.forEach((_, index) => {
        setTimeout(() => {
          setCurrentStep(index);
        }, index * 4000);
      });

      return () => {
        clearInterval(interval);
        setProgress(0);
        setCurrentStep(0);
      };
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      sx={{ zIndex: "10000000000000000000000000000000000000" }}
      PaperProps={{
        style: {
          backgroundColor: "#000000",
          color: "#0BBF99",
          padding: "40px",
          borderRadius: "20px",
          border: "2px solid #0BBF99",
          minWidth: "400px",
          maxWidth: "400px",
          textAlign: "center",
        },
      }}
    >
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <RingLoader color="#0BBF99" size={50} />
          <Box sx={{ width: "100%", textAlign: "center" }}>
            {customLabel ? (
              <Typography
                variant="body2"
                sx={{ mb: 1, opacity: 0.8, fontSize: "14px" }}
              >
                {customLabel}
              </Typography>
            ) : (
              <>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    opacity: 0.8,
                    fontSize: "14px",
                  }}
                >
                  Step {currentStep + 1} of {steps.length}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  {steps[currentStep]}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(11, 191, 153, 0.2)",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#0BBF99",
                      borderRadius: 4,
                    },
                  }}
                />
              </>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
