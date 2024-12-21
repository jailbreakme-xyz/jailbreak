import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import { styled } from "@mui/system";
import { FileUploader } from "react-drag-drop-files";
import Grid from "@mui/material/Grid2";

const fileTypes = ["JPG", "JPEG", "PNG", "GIF"];
const FormSection = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const AdvancedCreation = () => {
  const formik = useFormik({
    initialValues: {
      // Agent Details
      title: "",
      name: "",
      level: "",
      tldr: "",
      label: "",
      task: "",
      winning_message: "",
      image: null,
      pfp: null,
      status: "",
      assistant_id: "",
      disable: "",
      language: "",

      // Tournament Details
      start_date: "",
      characterLimit: 1000,
      charactersPerWord: 70,
      suffix: "",
      agent_logic: "",
      winner: "",
      break_attempts: 0,
      usd_prize: 0,
      contextLimit: 1,
      expiry: "",
      model: "",
      chatLimit: 100,
      entryFee: 0.045,
      fee_multiplier: 100,
      initial_pool_size: 4.5,
      developer_fee: 30,
      expiry_logic: "",
      style: "",
      tools_description: "",
      success_function: "",
      fail_function: "",
      tool_choice: "",
      instructions: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      name: Yup.string().required("Name is required"),
      level: Yup.string().required("Level is required"),
      tldr: Yup.string().required("TLDR is required"),
      start_date: Yup.date().required("Start date is required"),
      expiry: Yup.date().required("Expiry date is required"),
    }),
    onSubmit: (values) => {
      console.log("Form Data:", values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="advanced-creation-form">
      <FormSection>
        <h2>Agent Details</h2>
        <hr />
        <Grid container spacing={2}>
          <Grid
            item
            size={{ xs: 3, md: 3, lg: 3 }}
            className="file-upload-container"
          >
            <FileUploader
              handleChange={(files) => formik.setFieldValue("pfp", files[0])}
              name="file"
              types={fileTypes}
              label="Upload Agent PFP"
              classes="pointer"
              required={true}
            />
          </Grid>
          <Grid item size={{ xs: 4, md: 4, lg: 4 }}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
              focused
              variant="standard"
            />
          </Grid>
          <Grid item size={{ xs: 4, md: 4, lg: 4 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              focused
              variant="standard"
            />
          </Grid>
          <Grid item size={{ xs: 12, md: 12, lg: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="TLDR"
              name="tldr"
              value={formik.values.tldr}
              onChange={formik.handleChange}
              error={formik.touched.tldr && Boolean(formik.errors.tldr)}
              helperText={formik.touched.tldr && formik.errors.tldr}
              focused
              variant="standard"
            />
          </Grid>
        </Grid>
      </FormSection>

      <FormSection>
        <h2>Tournament Details</h2>
        <hr />
        <Grid container spacing={2}>
          <Grid item xs={6} md={6} lg={6}>
            <input
              className="date-field styled-date-input"
              type="datetime-local"
              name="start_date"
              value={formik.values.start_date}
              onChange={formik.handleChange}
            />
            {/* <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="datetime-local"
              value={formik.values.start_date}
              onChange={formik.handleChange}
              error={
                formik.touched.start_date && Boolean(formik.errors.start_date)
              }
              helperText={formik.touched.start_date && formik.errors.start_date}
            /> */}
          </Grid>
          <Grid item xs={6} md={6} lg={6}>
            {/* <TextField
              fullWidth
              label="Expiry Date"
              name="expiry"
              type="datetime-local"
              value={formik.values.expiry}
              onChange={formik.handleChange}
              error={formik.touched.expiry && Boolean(formik.errors.expiry)}
              helperText={formik.touched.expiry && formik.errors.expiry}
            /> */}
            <input
              className="date-field styled-date-input"
              type="datetime-local"
              name="expiry"
              value={formik.values.expiry}
              onChange={formik.handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Entry Fee"
              name="entryFee"
              type="number"
              value={formik.values.entryFee}
              onChange={formik.handleChange}
              focused
              variant="standard"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Prize Pool"
              name="initial_pool_size"
              type="number"
              value={formik.values.initial_pool_size}
              onChange={formik.handleChange}
              focused
              variant="standard"
            />
          </Grid>
        </Grid>
      </FormSection>

      {/* <Button type="submit" variant="contained" color="primary">
        Submit
      </Button> */}
    </form>
  );
};

export default AdvancedCreation;
