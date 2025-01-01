"use client";
import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import { styled } from "@mui/system";
import { FileUploader } from "react-drag-drop-files";
import Grid from "@mui/material/Grid2";
import ProfilePictureUploader from "./ProfilePictureUploader";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { IoMdAddCircle } from "react-icons/io";
import { ImCross } from "react-icons/im";
import NumberInputAdornments from "../mui/NumberInput";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { FaSadCry } from "react-icons/fa";
import { Transaction, Connection } from "@solana/web3.js";
import bs58 from "bs58";
import RingLoader from "react-spinners/RingLoader";
import { FaWandMagicSparkles } from "react-icons/fa6";
import {
  WalletMultiButton,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";
import { BiInfoCircle } from "react-icons/bi";
import Tooltip from "@mui/material/Tooltip";

const SOLANA_RPC =
  process.env.NODE_ENV === "development"
    ? "https://brande-ffqoic-fast-devnet.helius-rpc.com"
    : "https://rosette-xbrug1-fast-mainnet.helius-rpc.com";

const FormSection = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const InfoIconStyled = styled(BiInfoCircle)({
  fontSize: "16px",
  marginLeft: "5px",
  verticalAlign: "middle",
  cursor: "help",
  color: "#0BBF99",
});

const LabelWithTooltip = ({ label, tooltip }) => (
  <span style={{ display: "flex", alignItems: "center" }}>
    {label}
    <Tooltip
      title={tooltip}
      placement="top"
      componentsProps={{
        popper: {
          sx: {
            zIndex: 100000000001,
          },
        },
      }}
    >
      <InfoIconStyled />
    </Tooltip>
  </span>
);

const formatDateToLocal = (date) => {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  d.setMinutes(d.getMinutes() - offset);
  return d.toISOString().slice(0, 16);
};

const AdvancedCreation = (props) => {
  const [activeTypeTab, setActiveTypeTab] = useState("phrases");
  const { publicKey, sendTransaction, connected, wallet } = useWallet();
  const [generating, setGenerating] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [launchLoading, setLaunchLoading] = useState(null);
  const [launchError, setLaunchError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [generatingModalOpen, setGeneratingModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [settings, setSettings] = useState(null);
  const [newAgentLink, setNewAgentLink] = useState(null);
  const [sample, setSample] = useState(null);
  const { setVisible, visible } = useWalletModal();

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
      disable: [""],
      language: "",
      opening_message: "",
      tools_description: "",
      success_function: "",
      fail_function: "",
      instructions: "",
      tools: [
        { name: "", instruction: "", description: "" },
        { name: "", instruction: "", description: "" },
        { name: "", instruction: "", description: "" },
      ],
      // Tournament Details
      characterLimit: 750,
      charactersPerWord: 50,
      suffix: "",
      allow_special_characters: true,
      agent_logic: "",
      tool_choice_required: false,
      score_user_prompts: false,
      holdings: false,
      winner: "",
      break_attempts: 0,
      usd_prize: 0,
      contextLimit: 1,
      start_date: formatDateToLocal(new Date()),
      expiry: formatDateToLocal(
        new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      ),
      model: "",
      chatLimit: 100,
      entryFee: 0.045,
      constant_message_price: false,
      fee_multiplier: 100,
      initial_pool_size: 4.5,
      developer_fee: 30,
      expiry_logic: "last_message_sender",
      style: "",
      phrases: [""],
      success_function: "",
    },
    validationSchema: Yup.object({
      // pfp: Yup.mixed(),
      name: Yup.string()
        .min(3, "Name must be at least 3 characters")
        .max(16, "Name must be at most 16 characters")
        .required("Name is required"),
      opening_message: Yup.string()
        .min(10, "Intro must be at least 10 characters")
        .max(130, "Intro must be at most 130 characters")
        .required("Intro is required"),
      instructions: Yup.string()
        .min(100, "Instructions must be at least 100 characters")
        .max(10000, "Instructions must be at most 10,000 characters")
        .required("Instructions are required"),
      initial_pool_size: Yup.number()
        .min(0.5, "Initial Pool Size must be at least 0.5")
        .max(10000, "Initial Pool Size must be at most 10,000")
        .required("Initial Pool Size is required"),
      fee_multiplier: Yup.number()
        .min(1, "Fee Multiplier must be at least 1")
        .max(1000, "Fee Multiplier must be at most 1000")
        .required("Fee Multiplier is required"),
      tldr: Yup.string().required("TLDR is required"),
      start_date: Yup.date().required("Start date is required"),
      expiry: Yup.date().required("Expiry date is required"),
    }),
    onSubmit: (values) => {
      if (
        (typeof values.pfp === "string" && values.pfp.startsWith("/images")) ||
        !values.pfp
      ) {
        setErrorModalOpen("PFP is required");
        return;
      }

      if (values.allow_special_characters) {
        formik.setFieldValue("disable", [""]);
      } else {
        formik.setFieldValue("disable", ["special_characters"]);
      }

      if (activeTypeTab === "phrases") {
        if (values.phrases.length === 0) {
          setErrorModalOpen(
            "Secret phrases are required in this type of tournament"
          );
          return;
        }

        if (
          values.phrases.some((phrase) => !values.instructions.includes(phrase))
        ) {
          setErrorModalOpen("Secret phrases must be in the instructions");
          return;
        }

        if (
          values.phrases.some(
            (phrase) => phrase.length < 5 || phrase.length > 255
          )
        ) {
          setErrorModalOpen("Each phrase must be between 5 and 255 characters");
          return;
        }
      } else {
        if (values.tools.length < 2) {
          setErrorModalOpen(
            "At least 2 tools are required in this type of tournament"
          );
          return;
        }

        if (values.tools.some((tool) => tool.name === "")) {
          setErrorModalOpen("Tool name cannot be empty");
          return;
        }

        if (values.tools.some((tool) => tool.instruction === "")) {
          setErrorModalOpen("Tool instruction cannot be empty");
          return;
        }

        if (values.tools.some((tool) => tool.description === "")) {
          setErrorModalOpen("Tool description cannot be empty");
          return;
        }

        if (values.success_function === "") {
          setErrorModalOpen("Winning function cannot be empty");
          return;
        }
      }

      createTransaction(values);
    },
  });

  const loadSettings = async () => {
    setLoadingForm(true);
    const data = await axios
      .get(`/api/program/deployment-data?advanced=true`)
      .then((res) => res.data)
      .catch((err) => err);
    setSettings(data.deploymentData);

    if (props.sample) {
      const source = props.sample;
      formik.setFieldValue("name", source.name);
      formik.setFieldValue("title", source.title);
      formik.setFieldValue("tldr", source.tldr);
      formik.setFieldValue("opening_message", source.label);
      formik.setFieldValue("instructions", source.instructions);
      formik.setFieldValue("tools_description", source.tools_description);
      formik.setFieldValue("characterLimit", source.characterLimit || 500);
      formik.setFieldValue("contextLimit", source.contextLimit || 10);
      formik.setFieldValue("chatLimit", source.chatLimit || 100);
      formik.setFieldValue(
        "initial_pool_size",
        source.initial_pool_size || 0.5
      );
      formik.setFieldValue("developer_fee", source.developer_fee || 30);
      formik.setFieldValue("fee_multiplier", source.fee_multiplier || 100);
      formik.setFieldValue(
        "constant_message_price",
        source.fee_multiplier === 1
      );
      formik.setFieldValue(
        "expiry_logic",
        source.expiry_logic || "last_message_sender"
      );
      formik.setFieldValue(
        "start_date",
        new Date(source.start_date).toISOString().slice(0, 16)
      );
      formik.setFieldValue(
        "expiry",
        new Date(source.expiry).toISOString().slice(0, 16)
      );

      // Set phrases if available
      if (source.phrases && source.phrases.length > 0) {
        formik.setFieldValue("phrases", source.phrases);
        setActiveTypeTab("phrases");
      } else {
        formik.setFieldValue("phrases", [""]);
        setActiveTypeTab("decision");
      }

      // Set tools if available
      if (source.tools && source.tools.length > 0) {
        formik.setFieldValue("tools", source.tools);
      }
      setSample(props.sample);
    } else {
      setSample(data.sample);
    }

    setLoadingForm(false);
  };

  const handleTabChange = (event, newValue) => {
    // if (newValue === "decision") {
    //   if (formik.values.tools.length < 2) {
    //     formik.setFieldValue("tools", [
    //       ...formik.values.tools,
    //       { name: "", instruction: "", description: "" },
    //       { name: "", instruction: "", description: "" },
    //     ]);
    //   }
    // }
    setActiveTypeTab(newValue);
  };

  const addTool = () => {
    if (formik.values.tools.length < 4) {
      formik.setFieldValue("tools", [
        ...formik.values.tools,
        { name: "", instruction: "", description: "" },
      ]);
    }
  };

  const removeTool = (index) => {
    if (formik.values.tools.length > 2) {
      const newTools = formik.values.tools.filter((_, i) => i !== index);
      formik.setFieldValue("tools", newTools);
    }
  };

  const addPhrase = () => {
    if (formik.values.phrases.length < 10) {
      formik.setFieldValue("phrases", [...formik.values.phrases, ""]);
    }
  };

  const removePhrase = (index) => {
    if (formik.values.phrases.length > 1) {
      const newPhrases = formik.values.phrases.filter((_, i) => i !== index);
      formik.setFieldValue("phrases", newPhrases);
    }
  };

  // Add validation for start date
  const handleStartDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const now = new Date();
    const maxStart = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (selectedDate > maxStart) {
      formik.setFieldValue("start_date", formatDateToLocal(maxStart));
    } else if (selectedDate < now) {
      formik.setFieldValue("start_date", formatDateToLocal(now));
    } else {
      formik.setFieldValue("start_date", e.target.value);
    }

    // Update expiry if needed
    const currentExpiry = new Date(formik.values.expiry);
    const maxExpiry = new Date(
      selectedDate.getTime() + 30 * 24 * 60 * 60 * 1000
    ); // 1 month from start
    if (currentExpiry > maxExpiry) {
      formik.setFieldValue("expiry", formatDateToLocal(maxExpiry));
    }
  };

  // Add validation for expiry date
  const handleExpiryDateChange = (e) => {
    const selectedExpiry = new Date(e.target.value);
    const startDate = new Date(formik.values.start_date);
    const maxExpiry = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month from start
    const minExpiry = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // 1 day from start

    if (selectedExpiry > maxExpiry) {
      formik.setFieldValue("expiry", formatDateToLocal(maxExpiry));
    } else if (selectedExpiry < minExpiry) {
      formik.setFieldValue("expiry", formatDateToLocal(minExpiry));
    } else {
      formik.setFieldValue("expiry", e.target.value);
    }
  };

  const createAuthenticatedRequest = async (
    endpoint,
    options = {},
    formData
  ) => {
    // First try using stored JWT
    const storedToken = localStorage.getItem("token");

    let config = {
      url: endpoint,
      method: options.method || "GET",
      headers: {
        ...options.headers,
      },
    };

    // Add FormData configuration if provided
    if (formData instanceof FormData) {
      config = {
        ...config,
        data: formData,
        headers: {
          ...config.headers,
          "Content-Type": "multipart/form-data",
        },
      };
    }

    if (storedToken) {
      try {
        const verifyResponse = await axios.get("/api/auth/verify-token", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            address: publicKey.toString(),
          },
        });

        if (verifyResponse.status === 200) {
          config.headers.Authorization = `Bearer ${storedToken}`;
          const response = await axios(config);
          return response.data;
        }
      } catch (error) {
        localStorage.removeItem("token");
      }
    }

    if (!connected || !publicKey || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      const message = `Authenticate with your wallet: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await wallet.adapter.signMessage(encodedMessage);

      config.headers = {
        ...config.headers,
        signature: bs58.encode(signature),
        publickey: publicKey.toString(),
        message: message,
        timestamp: Date.now().toString(),
      };

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error("Authentication error:", error);
      setErrorModalOpen(error.response?.data?.error || error.message);
      throw error;
    }
  };

  const createTransaction = async (values) => {
    setLaunchLoading("Creating Transaction...");
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");

      // Create FormData
      const formData = new FormData();
      const tournamentData = {
        sender: props.publicKey,
        name: values.name,
        instructions: values.instructions,
        initial_pool_size: values.initial_pool_size,
        fee_multiplier: values.fee_multiplier,
        developer_fee: values.developer_fee,
        opening_message: values.opening_message,
        tournament_type: activeTypeTab,
        phrases: values.phrases,
        tools: values.tools,
        tools_description: values.tools_description,
        tool_choice_required: values.tool_choice_required,
        success_function: values.success_function,
        disable: values.disable,
        characterLimit: values.characterLimit,
        contextLimit: values.contextLimit,
        charactersPerWord: values.charactersPerWord,
        constant_message_price: values.constant_message_price,
        expiry: values.expiry,
        start_date: values.start_date,
        title: values.title,
        tldr: values.tldr,
        // advanced: true,
      };

      // Append the stringified data object and pfp file separately
      formData.append("data", JSON.stringify(tournamentData));
      formData.append("pfp", values.pfp);
      const response = await createAuthenticatedRequest(
        "/api/transactions/advanced-create-start-tournament-transaction",
        { method: "POST" },
        formData
      );

      setLaunchLoading("Waiting for confirmation...");
      const { serializedTransaction, tournamentPDA, tournamentId, token } =
        response;

      localStorage.setItem("token", token);
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );

      const signedTransaction = await sendTransaction(transaction, connection);
      console.log("Transaction sent:", signedTransaction);

      setLaunchLoading("Deploying program...");
      const confirmation = await connection.confirmTransaction({
        signature: signedTransaction,
        commitment: "confirmed",
      });

      if (confirmation.value.err) {
        setErrorModalOpen(error.message);
        setLaunchLoading(null);
        return false;
      }

      // Use same formData for second endpoint
      await advancedStartTournament(
        formData,
        tournamentPDA,
        tournamentId,
        token
      );
    } catch (error) {
      console.error("Error creating transaction:", error);
      setErrorModalOpen(error.response?.data?.error || error.message);
      setLaunchLoading(null);
    }
  };

  const advancedStartTournament = async (
    formData,
    tournamentPDA,
    tournamentId,
    token
  ) => {
    setLaunchLoading("Deploying Agent...");
    try {
      // Add tournament specific fields to formData
      formData.append("tournamentPDA", tournamentPDA);
      formData.append("tournamentId", tournamentId);

      const response = await axios.post(
        "/api/program/advanced-start-tournament",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.savedAgent) {
        setNewAgentLink(`/break/${response.data.savedAgent.name}`);
        setLaunchLoading(null);
        setSuccessModalOpen(true);
      } else {
        setErrorModalOpen(response.data.error);
        setLaunchLoading(null);
      }
    } catch (error) {
      console.error("Error deploying agent:", error);
      setErrorModalOpen(error?.response?.data?.error || error.message);
      setLaunchLoading(null);
    }
  };

  const generateAgent = async (e) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }

    setGeneratingModalOpen(true);
    setGenerating("1/5 Generating...");
    setTimeout(() => setGenerating("2/5 Crafting a unique agent..."), 5000);
    setTimeout(
      () => setGenerating("3/5 Drafting a new instructions..."),
      10000
    );
    setTimeout(() => setGenerating("4/5 Building agent schema..."), 15000);
    setTimeout(() => setGenerating("5/5 Creating an image..."), 20000);
    try {
      const response = await axios.post("/api/program/generate-agent", {
        sender: props.publicKey,
        name: formik.values.name,
        instructions: formik.values.instructions,
        opening_message: formik.values.opening_message,
      });

      const generatedAgent = response.data.newAgent;
      const imageUrl = generatedAgent.imageUrl;
      formik.setFieldValue("name", generatedAgent.name);
      formik.setFieldValue("opening_message", generatedAgent.label);
      formik.setFieldValue("instructions", generatedAgent.instructions);
      formik.setFieldValue("phrases", [generatedAgent.phrase]);
      formik.setFieldValue("title", generatedAgent.title);
      formik.setFieldValue("tldr", generatedAgent.tldr);
      formik.setFieldValue("pfp", imageUrl);
      setImagePreview(imageUrl);
      setGenerating(null);
      setGeneratingModalOpen(false);
    } catch (error) {
      console.error("Error generating agent:", error);
      setGenerationError(error.response.data.error);
      setGenerating(null);
      setGeneratingModalOpen(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div>
      <form
        onSubmit={formik.handleSubmit}
        className="advanced-creation-form"
        style={{ position: "relative" }}
      >
        {props.close && (
          <IconButton
            style={{ position: "absolute", top: 10, right: 10 }}
            className="pointer"
            onClick={() => {
              props.handleAdvancedModalClose();
            }}
          >
            <ImCross size={20} style={{ fill: "#0BBF99" }} />
          </IconButton>
        )}

        <FormSection>
          <Grid container spacing={1} sx={{ alignItems: "center" }}>
            <Grid
              size={{ xs: 2, md: 2, lg: 2 }}
              sx={{ justifyContent: "center" }}
              spacing={1}
            >
              {!loadingForm ? (
                <ProfilePictureUploader
                  sample={sample?.pfp}
                  preview={imagePreview}
                  onFileChange={(file) => formik.setFieldValue("pfp", file)}
                  error={formik.touched.pfp ? formik.errors.pfp : undefined}
                  helperText={
                    formik.touched.pfp && formik.errors.pfp
                      ? formik.errors.pfp
                      : undefined
                  }
                />
              ) : (
                <Skeleton
                  height={100}
                  width={100}
                  style={{ borderRadius: "50%" }}
                />
              )}
              {/* <p
                style={{
                  fontSize: "12px",
                  color: "#0BBF99",
                  textAlign: "center",
                  width: "90px",
                }}
              >
                Agent PFP
              </p> */}
            </Grid>
            <Grid size={{ xs: 12, md: 5, lg: 5 }}>
              <TextField
                fullWidth
                label={
                  <LabelWithTooltip
                    label="Name"
                    tooltip="Choose a unique name for your AI agent (3-16 characters)"
                  />
                }
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name ? formik.errors.name : undefined}
                helperText={formik.touched.name && formik.errors.name}
                focused="true"
                variant="standard"
                placeholder={sample?.name}
                autoComplete="off"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5, lg: 5 }}>
              <TextField
                fullWidth
                label={
                  <LabelWithTooltip
                    label="Title"
                    tooltip="A title that describes your agent's role or purpose"
                  />
                }
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title ? formik.errors.title : undefined}
                helperText={formik.touched.title && formik.errors.title}
                focused="true"
                variant="standard"
                placeholder={sample?.title || "Enter a title"}
                autoComplete="off"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 12, lg: 12 }} sx={{ marginTop: 1 }}>
              <TextField
                fullWidth
                label={
                  <LabelWithTooltip
                    label="Intro"
                    tooltip="This will appear as a short introduction to your agent (10-130 characters)"
                  />
                }
                name="opening_message"
                value={formik.values.opening_message}
                onChange={formik.handleChange}
                error={
                  formik.touched.opening_message
                    ? formik.errors.opening_message
                    : undefined
                }
                helperText={
                  formik.touched.opening_message &&
                  formik.errors.opening_message
                }
                focused="true"
                variant="standard"
                placeholder={sample?.label || "Enter an opening message"}
                autoComplete="off"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 12 }} sx={{ marginTop: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={
                  <LabelWithTooltip
                    label="TLDR"
                    tooltip="A brief summary of your agent's purpose and winning conditions"
                  />
                }
                name="tldr"
                placeholder={sample?.tldr || "Enter a TLDR"}
                value={formik.values.tldr}
                onChange={formik.handleChange}
                error={formik.touched.tldr ? formik.errors.tldr : undefined}
                helperText={formik.touched.tldr && formik.errors.tldr}
                focused="true"
                variant="outlined"
                sx={{
                  backgroundColor: "#000",
                }}
                autoComplete="off"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 12 }} sx={{ marginTop: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={
                  <LabelWithTooltip
                    label="Instructions (System Prompt)"
                    tooltip="Detailed instructions that define your agent's personality, knowledge, and behavior (100-10,000 characters)"
                  />
                }
                name="instructions"
                placeholder={sample?.instructions || "Enter instructions"}
                value={formik.values.instructions}
                onChange={formik.handleChange}
                error={
                  formik.touched.instructions
                    ? formik.errors.instructions
                    : undefined
                }
                helperText={
                  formik.touched.instructions && formik.errors.instructions
                }
                focused="true"
                variant="outlined"
                sx={{
                  backgroundColor: "#000",
                }}
                autoComplete="off"
              />
            </Grid>
            {props.mode != "edit" && (
              <button
                onClick={(e) => {
                  generateAgent(e);
                }}
                className="pointer"
                style={{
                  fontSize: "12px",
                  backgroundColor: generationError ? "#FE3448" : "#0BBF99",
                  color: "#000",
                  border: generationError
                    ? "2px solid #FE3448"
                    : "2px solid #0BBF99",
                  padding: "8px 10px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {generating && !generationError ? (
                  <RingLoader color="#000" size={14} />
                ) : (
                  <FaWandMagicSparkles />
                )}
                {generationError ? (
                  <span style={{ marginLeft: "5px" }} className="pointer">
                    {generationError}
                  </span>
                ) : (
                  <span
                    style={{ margin: "0px 0px 0px 5px" }}
                    className="pointer"
                  >
                    {generating ? generating : "Auto Generate (BETA)"}
                  </span>
                )}
              </button>
            )}
            {settings?.content?.show_help && (
              <p
                style={{
                  fontSize: "14px",
                  margin: "5px 0px 0px",
                }}
              >
                Need help? Check out our{" "}
                <a
                  href={settings?.content?.show_help}
                  target="_blank"
                  className="pointer"
                  style={{
                    color: "#0BBF99",
                    fontWeight: "bold",
                  }}
                >
                  tutorial
                </a>
              </p>
            )}
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <h3>🛠️ Tools (Optional)</h3>
              <hr />
              <p style={{ fontSize: "12px", color: "#0BBF99", margin: "0px" }}>
                Leave blank if you don&apos;t want the agent to use tools
              </p>
              <FormSection sx={{ marginTop: 3 }}>
                <Grid size={{ xs: 12, md: 12, lg: 12 }} sx={{ marginTop: 2 }}>
                  <TextField
                    fullWidth
                    label={
                      <LabelWithTooltip
                        label="Tools Description"
                        tooltip="A brief description of how your agent should use its available tools"
                      />
                    }
                    name="tools_description"
                    value={formik.values.tools_description}
                    onChange={formik.handleChange}
                    focused="true"
                    variant="outlined"
                    placeholder={
                      sample?.tools_description || "Enter tools description"
                    }
                    autoComplete="off"
                  />
                </Grid>
                {formik.values.tools.map((tool, index) => (
                  <div key={index} style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <h5>Tool {index + 1}</h5>
                      {index >= 2 && (
                        <Grid
                          size={{ xs: 2, md: 2, lg: 2 }}
                          sx={{ justifyContent: "flex-end", display: "flex" }}
                        >
                          <IconButton
                            className="pointer"
                            onClick={() => removeTool(index)}
                            disabled={formik.values.tools.length <= 2}
                          >
                            <ImCross size={20} style={{ fill: "red" }} />
                          </IconButton>
                        </Grid>
                      )}
                    </div>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, md: 6, lg: 6 }}>
                        <TextField
                          focused
                          fullWidth
                          label={
                            <LabelWithTooltip
                              label="Name"
                              tooltip="The name of this tool - this is what the agent will use to reference it"
                            />
                          }
                          name={`tools.${index}.name`}
                          value={tool.name}
                          onChange={formik.handleChange}
                          variant="outlined"
                          placeholder={
                            sample?.tools[index]?.name || "Enter a name"
                          }
                          autoComplete="off"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 6, lg: 6 }}>
                        <TextField
                          focused
                          fullWidth
                          label={
                            <LabelWithTooltip
                              label="Instruction"
                              tooltip="Instructions for how and when the agent should use this tool"
                            />
                          }
                          name={`tools.${index}.instruction`}
                          value={tool.instruction}
                          onChange={formik.handleChange}
                          variant="outlined"
                          placeholder={
                            sample?.tools[index]?.parameters.properties.results
                              .description || "Enter an instruction"
                          }
                          autoComplete="off"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 12, lg: 12 }}>
                        <TextField
                          focused
                          fullWidth
                          label={
                            <LabelWithTooltip
                              label="Description"
                              tooltip="A description of what this tool does and its purpose"
                            />
                          }
                          name={`tools.${index}.description`}
                          value={tool.description}
                          onChange={formik.handleChange}
                          variant="outlined"
                          placeholder={
                            sample?.tools[index]?.description ||
                            "Enter a description"
                          }
                          autoComplete="off"
                        />
                      </Grid>
                    </Grid>
                  </div>
                ))}
                {formik.values.tools.length < 4 && (
                  <Button
                    style={{ marginTop: "15px", color: "#0BBF99" }}
                    className="pointer"
                    onClick={addTool}
                    disabled={formik.values.tools.length >= 4}
                  >
                    <IoMdAddCircle size={20} style={{ marginRight: 5 }} /> Add
                    Tool
                  </Button>
                )}
              </FormSection>
            </Grid>
          </Grid>
        </FormSection>
        <FormSection>
          <h3>🏆 Tournament Settings</h3>
          <hr />
          <Grid container spacing={1}>
            <Grid size={{ xs: 6, md: 6, lg: 6 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Start Date"
                  tooltip="The date and time when the tournament will start"
                />
              </p>
              <input
                style={{ width: "95%" }}
                className="date-field styled-date-input"
                type="datetime-local"
                name="start_date"
                value={formik.values.start_date}
                onChange={handleStartDateChange}
                min={formatDateToLocal(new Date(Date.now() - 15 * 60 * 1000))} // Add 15 minutes buffer
                max={formatDateToLocal(
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 6, lg: 6 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Expiry Date"
                  tooltip="The date and time when the tournament will end"
                />
              </p>
              <input
                style={{ width: "95%" }}
                className="date-field styled-date-input"
                type="datetime-local"
                name="expiry"
                value={formik.values.expiry}
                onChange={handleExpiryDateChange}
                min={formatDateToLocal(
                  new Date(
                    new Date(formik.values.start_date).getTime() +
                      24 * 60 * 60 * 1000
                  )
                )}
                max={formatDateToLocal(
                  new Date(
                    new Date(formik.values.start_date).getTime() +
                      30 * 24 * 60 * 60 * 1000
                  )
                )}
              />
            </Grid>
            {/* <Grid size={{ xs: 4, md: 4, lg: 4 }}>
              <p>Expiry Winner ⏱️</p>
              <Select
                fullWidth
                name="expiry_logic"
                value={formik.values.expiry_logic}
                onChange={formik.handleChange}
                focused="true"
              >
                <MenuItem value="last_message_sender" selected>
                  Last Message Sender
                </MenuItem>
                <MenuItem value="highest_score">Highest Score</MenuItem>
              </Select>
            </Grid> */}
            <Grid size={{ xs: 6, md: 4, lg: 4 }} sx={{ marginTop: 2 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Max Message Length"
                  tooltip="The maximum number of characters allowed in a message"
                />
              </p>
              <NumberInputAdornments
                min={300}
                max={1000}
                step={100}
                value={formik.values.characterLimit}
                onChange={(val) => formik.setFieldValue("characterLimit", val)}
                label="Character Limit"
                name="characterLimit"
                noAdornment={true}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4, lg: 4 }} sx={{ marginTop: 2 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Max Word Length"
                  tooltip="The maximum number of characters allowed in a word"
                />
              </p>
              <NumberInputAdornments
                min={45}
                max={200}
                step={10}
                value={formik.values.charactersPerWord}
                onChange={(val) =>
                  formik.setFieldValue("charactersPerWord", val)
                }
                label="Characters Per Word"
                name="charactersPerWord"
                noAdornment={true}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4, lg: 4 }} sx={{ marginTop: 2 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Context Limit"
                  tooltip="The maximum number of messages the agent can remember for each user"
                />
              </p>
              <NumberInputAdornments
                min={1}
                max={20}
                step={1}
                value={formik.values.contextLimit}
                onChange={(val) => formik.setFieldValue("contextLimit", val)}
                label="Context Limit"
                name="contextLimit"
                noAdornment={true}
              />
            </Grid>

            <Grid size={{ xs: 3, md: 3, lg: 3 }} sx={{ marginTop: 2 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Initial Pool Size"
                  tooltip="The initial amount of SOL to be added to the prize pool (0.5-10,000 SOL)"
                />
              </p>
              <NumberInputAdornments
                min={0.5}
                max={10000}
                step={0.1}
                value={formik.values.initial_pool_size}
                onChange={(val) =>
                  formik.setFieldValue("initial_pool_size", val)
                }
                label="Initial Pool Size"
                name="initial_pool_size"
              />
            </Grid>
            <Grid
              size={{ xs: 1, md: 1, lg: 1 }}
              sx={{
                justifyContent: "center",
                alignItems: "flex-end",
                display: "flex",
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: "34px" }}>/</span>
            </Grid>
            <Grid size={{ xs: 3, md: 3, lg: 3 }} sx={{ marginTop: 2 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Fee Multiplier"
                  tooltip="Determines the entry fee as a percentage of the pool size (1-1000)"
                />
              </p>
              <NumberInputAdornments
                min={10}
                max={1000}
                step={10}
                value={formik.values.fee_multiplier}
                onChange={(val) => formik.setFieldValue("fee_multiplier", val)}
                label="Fee Multiplier"
                name="fee_multiplier"
                noAdornment={true}
              />
            </Grid>
            <Grid
              size={{ xs: 1, md: 1, lg: 1 }}
              sx={{
                justifyContent: "center",
                alignItems: "flex-end",
                display: "flex",
                marginTop: 2,
              }}
            >
              <span style={{ fontSize: "34px" }}>=</span>
            </Grid>
            <Grid size={{ xs: 4, md: 4, lg: 4 }} sx={{ marginTop: 2 }}>
              <p style={{ margin: "4px", fontSize: "14px" }}>
                <LabelWithTooltip
                  label="Initial Entry Fee"
                  tooltip="The initial amount of SOL required to enter the tournament"
                />
              </p>
              <NumberInputAdornments
                value={
                  formik.values.initial_pool_size / formik.values.fee_multiplier
                }
                label="Initial Entry Fee"
                name="entryFee"
                disabled={true}
                className={"disabled"}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 12, lg: 12 }}
              sx={{ marginTop: 2 }}
              spacing={1}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="constant_message_price"
                      value={formik.values.constant_message_price}
                      sx={{ color: "#0BBF99", fill: "#0BBF99" }}
                      checked={formik.values.constant_message_price}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Constant Message Price?"
                />
                <span style={{ fontSize: "12px", color: "#0BBF99" }}>
                  If checked, the tournament will have a constant message price.
                </span>
              </FormGroup>
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <h3>🎯 Tournament Type</h3>
              <Tabs
                value={activeTypeTab}
                onChange={handleTabChange}
                //   variant="fullWidth"
              >
                <Tab label="Secret Phrases" value="phrases" />
                <Tab label="Decision (Tool Call)" value="decision" />
                {/* <Tab label="Mixed" value="mixed" /> */}
              </Tabs>
            </Grid>
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              {activeTypeTab === "phrases" && (
                <div>
                  <p style={{ margin: "8px 0px 0px" }}>
                    Add up to 10 secret phrases that the user needs to reveal to
                    win the tournament
                  </p>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#0BBF99",
                      margin: "0px",
                    }}
                  >
                    It could be a secret
                    keyword/phrase/ingredient/location/etc..
                  </span>
                  {formik.values.phrases.map((phrase, index) => (
                    <Grid container spacing={2} key={index}>
                      <Grid
                        size={{ xs: 12, md: 12, lg: 12 }}
                        sx={{ marginTop: 2 }}
                      >
                        <TextField
                          fullWidth
                          placeholder={`Phrase ${index + 1}`}
                          label={
                            <LabelWithTooltip
                              label={`Phrase ${index + 1}`}
                              tooltip="A secret phrase that users must reveal to win the tournament"
                            />
                          }
                          name={`phrases.${index}`}
                          value={phrase}
                          onChange={formik.handleChange}
                          variant="outlined"
                          autoComplete="off"
                          slotProps={{
                            input: {
                              endAdornment: index > 0 && (
                                <InputAdornment position="end">
                                  <IconButton
                                    className="pointer"
                                    onClick={() => removePhrase(index)}
                                    disabled={formik.values.phrases.length <= 1}
                                  >
                                    <ImCross
                                      size={20}
                                      style={{ fill: "red" }}
                                    />
                                  </IconButton>
                                </InputAdornment>
                              ),
                              startAdornment: (
                                <InputAdornment position="start">
                                  🔒
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    style={{ marginTop: "15px", color: "#0BBF99" }}
                    className="pointer"
                    onClick={addPhrase}
                    disabled={formik.values.phrases.length >= 10}
                  >
                    <IoMdAddCircle size={20} style={{ marginRight: 5 }} /> Add
                    Phrase
                  </Button>
                </div>
              )}

              {activeTypeTab === "decision" && (
                <div>
                  {formik.values.tools.length < 2 ||
                  formik.values.tools.some(
                    (tool) =>
                      !tool.name || !tool.description || !tool.instruction
                  ) ? (
                    <p style={{ color: "red" }}>
                      The agent must have at least 2 fully defined tools to
                      choose this type.
                    </p>
                  ) : (
                    <FormControl fullWidth>
                      <InputLabel>Winning Function</InputLabel>

                      <Select
                        sx={{ padding: "5px" }}
                        name="success_function"
                        value={formik.values.success_function}
                        onChange={formik.handleChange}
                        input={<OutlinedInput label="Winning Function" />}
                      >
                        {formik.values.tools.map((tool, index) => (
                          <MenuItem key={index} value={tool.name}>
                            {tool.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <p style={{ margin: "8px 0px 0px" }}>
                        If the agent uses this tool, the sender will win the
                        tournament.
                      </p>
                    </FormControl>
                  )}
                </div>
              )}

              {activeTypeTab === "mixed" && (
                <div>
                  {formik.values.tools.length < 2 ||
                  formik.values.tools.some(
                    (tool) =>
                      !tool.name || !tool.description || !tool.instruction
                  ) ? (
                    <p style={{ color: "red" }}>
                      The agent must have at least 2 fully defined tools to
                      choose this type.
                    </p>
                  ) : (
                    <FormControl fullWidth>
                      <InputLabel>Winning Function</InputLabel>

                      <Select
                        sx={{ padding: "5px" }}
                        name="success_function"
                        value={formik.values.success_function}
                        onChange={formik.handleChange}
                        input={<OutlinedInput label="Winning Function" />}
                      >
                        {formik.values.tools.map((tool, index) => (
                          <MenuItem key={index} value={tool.name}>
                            {tool.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  <p style={{ margin: "8px 0px 0px" }}>
                    Add up to 10 secret phrases that the user needs to reveal to
                    win the tournament
                  </p>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#0BBF99",
                      margin: "0px",
                    }}
                  >
                    It could be a secret phrase/ingredient/location/etc..
                  </span>
                  {/* Combine logic for phrases and decision */}
                  {formik.values.phrases.map((phrase, index) => (
                    <Grid container spacing={2} key={index}>
                      <Grid
                        size={{ xs: 12, md: 12, lg: 12 }}
                        sx={{ marginTop: 2 }}
                      >
                        <TextField
                          autoComplete="off"
                          fullWidth
                          placeholder={`Phrase ${index + 1}`}
                          label={`Phrase ${index + 1}`}
                          name={`phrases.${index}`}
                          value={phrase}
                          onChange={formik.handleChange}
                          variant="outlined"
                          slotProps={{
                            input: {
                              endAdornment: index > 0 && (
                                <InputAdornment position="end">
                                  <IconButton
                                    className="pointer"
                                    onClick={() => removePhrase(index)}
                                    disabled={formik.values.phrases.length <= 1}
                                  >
                                    <ImCross
                                      size={20}
                                      style={{ fill: "red" }}
                                    />
                                  </IconButton>
                                </InputAdornment>
                              ),
                              startAdornment: (
                                <InputAdornment position="start">
                                  🔒
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    style={{ marginTop: "15px", color: "#0BBF99" }}
                    className="pointer"
                    onClick={addPhrase}
                    disabled={formik.values.phrases.length >= 10}
                  >
                    <IoMdAddCircle size={20} style={{ marginRight: 5 }} /> Add
                    Phrase
                  </Button>
                </div>
              )}
            </Grid>

            {activeTypeTab === "decision" && (
              <Grid
                size={{ xs: 12, md: 6, lg: 6 }}
                // sx={{ marginTop: 2 }}
                spacing={1}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="tool_choice_required"
                        value={formik.values.tool_choice_required}
                        sx={{ color: "#0BBF99", fill: "#0BBF99" }}
                        checked={formik.values.tool_choice_required}
                        onChange={formik.handleChange}
                      />
                    }
                    label="Require Tool Choice?"
                  />
                  <span style={{ fontSize: "12px", color: "#0BBF99" }}>
                    If checked, the agent will only use the tools provided in
                    the tools section.
                  </span>
                </FormGroup>
              </Grid>
            )}
            {/* <Grid
              size={{ xs: 6, md: 6, lg: 6 }}
              sx={{ marginTop: 2 }}
              spacing={1}
            >
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="score_user_prompts"
                      value={formik.values.score_user_prompts}
                      sx={{ color: "#0BBF99", fill: "#0BBF99" }}
                      checked={formik.values.score_user_prompts}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Score User Prompts?"
                />
                <span style={{ fontSize: "12px", color: "#0BBF99" }}>
                  If checked, our system will score the user&apos;s prompts
                  based on the phrases you provided.
                </span>
              </FormGroup>
            </Grid> */}
            <Grid size={{ xs: 12, md: 6, lg: 6 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="allow_special_characters"
                      value={formik.values.allow_special_characters}
                      sx={{ color: "#0BBF99", fill: "#0BBF99" }}
                      checked={formik.values.allow_special_characters}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Allow Dangerous Characters?"
                />
                <span style={{ fontSize: "12px", color: "#0BBF99" }}>
                  If checked, tournament&apos;s chat will allow dangerous
                  characters in the messages (#, @, etc.).
                </span>
              </FormGroup>
            </Grid>
            {/* <Grid size={{ xs: 6, md: 6, lg: 6 }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="holdings"
                      value={formik.values.holdings}
                      sx={{ color: "#0BBF99", fill: "#0BBF99" }}
                      checked={formik.values.holdings}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Collect User Holdings?"
                />
                <span style={{ fontSize: "12px", color: "#0BBF99" }}>
                  If checked, user&apos;s token holdings will be collected and
                  sent to the agent.
                </span>
              </FormGroup>
            </Grid> */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                width: "100%",
              }}
            >
              <Grid size={{ xs: 3, md: 1, lg: 3 }}>
                <p style={{ margin: "4px", fontSize: "14px" }}>
                  <LabelWithTooltip
                    label="Creator Share"
                    tooltip="Percentage of the prize pool that goes to you as the creator (20-50%)"
                  />
                </p>
                <NumberInputAdornments
                  suffix={"%"}
                  min={20}
                  max={50}
                  step={10}
                  value={formik.values.developer_fee}
                  onChange={(val) => formik.setFieldValue("developer_fee", val)}
                  label="Developer Fee"
                  name="developer_fee"
                />
              </Grid>
              <Grid
                size={{ xs: 6, md: 6, lg: 6 }}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                }}
              >
                {publicKey && connected ? (
                  <DialogActions
                    sx={{
                      padding: "0px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Button
                      type="submit"
                      size="large"
                      className="pointer"
                      variant="contained"
                      sx={{
                        backgroundColor: "#0BBF99",
                        color: "#000",
                        fontWeight: "bold",
                      }}
                    >
                      {launchLoading ? launchLoading : "LAUNCH AGENT"} 🚀
                    </Button>
                  </DialogActions>
                ) : (
                  <WalletMultiButton />
                )}
              </Grid>
            </div>
            <Grid size={{ xs: 12, md: 12, lg: 12 }}>
              <div style={{ margin: "15px 5px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "10px",
                  }}
                >
                  💰 Prize Pool Distribution
                </p>
                <div
                  style={{
                    border: "1px solid #0BBF99",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#0BBF9920" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Scenario
                        </th>
                        <th style={{ padding: "8px", textAlign: "right" }}>
                          Distribution
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "8px",
                            borderTop: "1px solid #0BBF9950",
                          }}
                        >
                          <strong>On Win:</strong>
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderTop: "1px solid #0BBF9950",
                            textAlign: "right",
                          }}
                        >
                          {100 - formik.values.developer_fee}% Winner
                          <br />
                          {formik.values.developer_fee - 10}% Creator
                          <br />
                          10% Platform
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "8px",
                            borderTop: "1px solid #0BBF9950",
                          }}
                        >
                          <strong>On Expiry:</strong>
                        </td>
                        <td
                          style={{
                            padding: "8px",
                            borderTop: "1px solid #0BBF9950",
                            textAlign: "right",
                          }}
                        >
                          {(90 - formik.values.developer_fee) * 0.25}% Last
                          Sender
                          <br />
                          {formik.values.developer_fee}% Creator
                          <br />
                          {(90 - formik.values.developer_fee) * 0.75}%
                          Participants
                          <br />
                          10% Platform
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Grid>
          </Grid>
        </FormSection>
      </form>
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
      <Dialog
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        sx={{ zIndex: "10000000000000000000000000000000000000" }}
        PaperProps={{
          style: {
            backgroundColor: "#000000",
            color: "#0BBF99",
            padding: "40px",
            borderRadius: "20px",
            border: "2px solid #0BBF99",
            minWidth: "300px",
            textAlign: "center",
            position: "relative",
          },
        }}
      >
        <IconButton
          className="close pointer"
          onClick={() => {
            setSuccessModalOpen(false);
            props.handleAdvancedModalClose();
          }}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            color: "#0BBF99",
          }}
        >
          <ImCross size={16} />
        </IconButton>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div style={{ fontSize: "40px" }}>🎉</div>
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              Agent Successfully Created!
            </div>
            <Button
              onClick={() => {
                window.open(newAgentLink, "_blank");
                setSuccessModalOpen(false);
                props.handleAdvancedModalClose();
              }}
              className="pointer"
              variant="contained"
              sx={{
                backgroundColor: "#0BBF99",
                color: "#000000",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#0BBF99",
                },
              }}
            >
              View Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={generatingModalOpen}
        sx={{ zIndex: "10000000000000000000000000000000000000" }}
        PaperProps={{
          style: {
            backgroundColor: "#000000",
            color: "#0BBF99",
            padding: "40px",
            borderRadius: "20px",
            border: "2px solid #0BBF99",
            minWidth: "300px",
            textAlign: "center",
          },
        }}
      >
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <RingLoader color="#0BBF99" size={50} />
            <div style={{ fontSize: "18px", fontWeight: "bold" }}>
              {generating}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedCreation;
