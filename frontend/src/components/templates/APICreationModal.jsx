import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import "../../styles/APICreationModal.css";
import { createSubmission } from "../../api/submission";

const APICreationModal = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
    if (alert.severity === "success") {
      onClose();
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      website: "",
      social: "",
      description: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Project name is required")
        .min(3, "Project name must be at least 3 characters"),
      website: Yup.string()
        .url("Must be a valid URL")
        .required("Project website is required"),
      social: Yup.string()
        .url("Must be a valid URL")
        .required("Social account URL is required"),
      description: Yup.string()
        .required("Agent concept is required")
        .min(
          10,
          "Please provide more details about your agent concept (min 10 characters)"
        ),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        await createSubmission(values);
        resetForm();
        onClose();
        // First show success message
        setAlert({
          open: true,
          message: "Submission created successfully!",
          severity: "success",
        });
      } catch (error) {
        setAlert({
          open: true,
          message: error.message || "Failed to create submission",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open && !alert.open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "api-creation-modal",
        }}
      >
        <DialogTitle className="modal-title">
          <span className="bot-emoji">🤖</span> Integrate your agent via API
        </DialogTitle>

        <DialogContent>
          <form onSubmit={formik.handleSubmit} className="api-creation-form">
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Project Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              className="form-field"
              disabled={loading}
              autoComplete="off"
            />

            <TextField
              fullWidth
              id="website"
              name="website"
              label="Project Website"
              value={formik.values.website}
              onChange={formik.handleChange}
              error={formik.touched.website && Boolean(formik.errors.website)}
              helperText={formik.touched.website && formik.errors.website}
              className="form-field"
              disabled={loading}
              autoComplete="off"
            />

            <TextField
              fullWidth
              id="social"
              name="social"
              label="Social Account URL"
              placeholder="https://twitter.com/username or https://t.me/username"
              value={formik.values.social}
              onChange={formik.handleChange}
              error={formik.touched.social && Boolean(formik.errors.social)}
              helperText={formik.touched.social && formik.errors.social}
              className="form-field"
              disabled={loading}
              autoComplete="off"
            />

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Agent Concept"
              multiline
              rows={3}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={
                formik.touched.description && Boolean(formik.errors.description)
              }
              helperText={
                formik.touched.description && formik.errors.description
              }
              className="form-field"
              disabled={loading}
              autoComplete="off"
            />

            <div className="button-container">
              <Button
                variant="outlined"
                onClick={onClose}
                className="cancel-button"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={alert.open}
        onClose={handleCloseAlert}
        maxWidth="sm"
        PaperProps={{
          className: "api-creation-modal",
          sx: {
            minWidth: "300px",
            textAlign: "center",
            padding: "20px",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: alert.severity === "success" ? "#0bbf99" : "#ff4444",
            fontWeight: "bold",
          }}
        >
          {alert.severity === "success" ? "✅ Success" : "❌ Error"}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", py: 2 }}>
          <p style={{ margin: "10px 0 20px 0", color: "#fff" }}>
            {alert.message}
          </p>
          <Button
            variant="contained"
            onClick={handleCloseAlert}
            sx={{
              bgcolor: alert.severity === "success" ? "#0bbf99" : "#ff4444",
              "&:hover": {
                bgcolor: alert.severity === "success" ? "#0eae8d" : "#ff3333",
              },
            }}
          >
            {alert.severity === "success" ? "Done" : "Try Again"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default APICreationModal;
