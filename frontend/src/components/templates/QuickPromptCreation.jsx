import React, { useState } from "react";
import { TextField, Button, Box, CircularProgress, Chip } from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, Transaction } from "@solana/web3.js";
import { toast } from "react-hot-toast";
import LoadingModal from "./modals/LoadingModal";
import ErrorModal from "./modals/ErrorModal";
import axios from "axios";
import SuccessModal from "./modals/SuccessModal";
import LaunchOptionsModal from "./modals/LaunchOptionsModal";
import QuickCreation from "./QuickCreation";
import AdvancedModal from "./AdvancedModal";
import APICreationModal from "./APICreationModal";
import PromptCreationModal from "./PromptCreationModal";

const SOLANA_RPC =
  process.env.NODE_ENV === "development"
    ? "https://brande-ffqoic-fast-devnet.helius-rpc.com"
    : "https://rosette-xbrug1-fast-mainnet.helius-rpc.com";

const SUGGESTIONS = [
  "Financial Agent",
  "Coding Agent",
  "Trading Agent",
  "Medical Agent",
];

const QuickPromptCreation = (props) => {
  const { sendTransaction, publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [loadingLabel, setLoadingLabel] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdAgent, setCreatedAgent] = useState(null);
  const [showLaunchOptions, setShowLaunchOptions] = useState(false);
  const [quickCreationOpen, setQuickCreationOpen] = useState(false);
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [apiCreationOpen, setAPICreationOpen] = useState(false);
  const [promptCreationOpen, setPromptCreationOpen] = useState(false);

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      if (!connected || !publicKey) {
        setError("Please connect your wallet to launch an agent.");
        setLoading(false);
        return;
      }

      const connection = new Connection(SOLANA_RPC, "confirmed");

      // Default values for other fields
      const formData = {
        prompt,
        initial_pool_size: 0.5,
        fee_multiplier: 1,
        fee_type: 1,
      };

      const createTxResponse = await fetch(
        "/api/transactions/create-agent-from-prompt",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            data: JSON.stringify(formData),
          }),
        }
      );

      const txResult = await createTxResponse.json();

      if (!createTxResponse.ok) {
        throw new Error(txResult.error || "Failed to create transaction");
      }

      setLoadingLabel("Waiting for transaction confirmation...");

      const transaction = Transaction.from(
        Buffer.from(txResult.serializedTransaction, "base64")
      );

      const signedTransaction = await sendTransaction(transaction, connection);

      const confirmation = await connection.confirmTransaction({
        signature: signedTransaction,
        commitment: "confirmed",
      });

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm");
      }

      setLoadingLabel("Launching Agent...");
      const tournamentData = txResult.tournament;
      tournamentData.useDefaultRules = true;

      const _formData = new FormData();
      _formData.append("data", JSON.stringify(tournamentData));
      _formData.append("pfp", tournamentData.pfp);
      _formData.append("tournamentId", txResult.tournamentId);
      _formData.append("tournamentPDA", txResult.tournamentPDA);

      const agentResponse = await axios.post(
        "/api/program/advanced-start-tournament",
        _formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!agentResponse.data.savedAgent) {
        throw new Error("Failed to create agent");
      }

      setCreatedAgent(agentResponse.data.savedAgent);
      setLoading(false);
      setLoadingLabel(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setPrompt("");
    } catch (error) {
      console.error("Error creating agent:", error);
      setError(error.message || "Failed to create agent");
      setLoadingLabel(null);
      setLoading(false);
    }
  };

  const handleQuickCreationClose = () => {
    setQuickCreationOpen(false);
  };

  const handleAdvancedModalOpen = () => {
    setAdvancedModalOpen(true);
  };

  const handleAdvancedModalClose = () => {
    setAdvancedModalOpen(false);
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(11, 191, 153, 0.1)",
        padding: "20px",
        borderRadius: "20px",
      }}
    >
      <h4 style={{ margin: "15px 2px 15px", color: "#0BBF99" }}>
        <span style={{ fontSize: "18px", marginRight: "5px" }}>🚀</span> Launch
        your agent with a single prompt (BETA)
      </h4>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
          maxWidth: "560px",
          margin: "10px 0px",
          padding: "0px",
        }}
      >
        <TextField
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your agent's personality and behavior..."
          autoComplete="off"
          sx={{
            borderRadius: {
              xs: "20px",
              sm: "50px 0px 0px 50px",
            },
            flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              height: "50px",
              "& fieldset": {
                border: "none",
              },
              "&:hover fieldset": {
                border: "none",
              },
              "&.Mui-focused fieldset": {
                border: "none",
              },
            },
            "& .MuiInputBase-input": {
              color: "#fff",
              height: "50px",
              padding: "0 14px",
            },
            backgroundColor: "rgba(11, 191, 153, 0.1)",
          }}
        />
        <Button
          type="submit"
          variant="contained"
          className="pointer"
          fullWidth
          sx={{
            backgroundColor: "#0bbf99",
            "&:hover": {
              backgroundColor: "#0aa888",
            },
            color: "black",
            height: "50px",
            minWidth: { xs: "100%", sm: "150px" },
            width: { xs: "100%", sm: "auto" },
            whiteSpace: "nowrap",
            borderRadius: {
              xs: "20px",
              sm: "0px 50px 50px 0px",
            },
            fontWeight: "bold",
            fontSize: { xs: "14px", sm: "16px" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : connected && publicKey ? (
            "Launch 🚀"
          ) : (
            "Launch 🚀"
          )}
        </Button>

        <LoadingModal
          open={loading}
          steps={[
            "Generating Agent Configuration...",
            "Creating Blockchain Transaction...",
            "Initializing Tournament...",
            "Drawing Agent Image...",
            "Finalizing Setup...",
            "Confirm Transaction...",
          ]}
          customLabel={loadingLabel}
        />
        <ErrorModal
          open={!!error}
          onClose={() => setError(null)}
          message={error}
        />
        <SuccessModal
          open={showSuccess}
          message="Your agent has been created!"
          agent={createdAgent}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          maxWidth: "560px",
          mt: 2,
          mb: 2,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, minWidth: "min-content" }}>
          {SUGGESTIONS.map((suggestion, index) => (
            <Chip
              className="pointer"
              key={index}
              label={
                suggestion.length > 40
                  ? suggestion.substring(0, 37) + "..."
                  : suggestion
              }
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                backgroundColor: "rgba(11, 191, 153, 0.1)",
                color: "#0bbf99",
                border: "1px solid #0bbf99",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "rgba(11, 191, 153, 0.2)",
                },
                "&:active": {
                  backgroundColor: "rgba(11, 191, 153, 0.3)",
                },
                height: "auto",
                padding: "8px 4px",
                borderRadius: "50px",
                whiteSpace: "nowrap",
                "& .MuiChip-label": {
                  whiteSpace: "nowrap",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          mt: 2,
          color: "#0BBF99",
          fontSize: "14px",
        }}
      >
        <span
          className="pointer"
          onClick={() => setShowLaunchOptions(true)}
          style={{
            textAlign: "left",
            textDecoration: "underline",
            opacity: 0.8,
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          View all launch options →
        </span>
      </Box>

      <LoadingModal
        open={loading}
        steps={[
          "Generating Agent Configuration...",
          "Creating Blockchain Transaction...",
          "Initializing Tournament...",
          "Drawing Agent Image...",
          "Finalizing Setup...",
          "Confirm Transaction...",
        ]}
      />
      <ErrorModal
        open={!!error}
        onClose={() => setError(null)}
        message={error}
      />
      <SuccessModal open={showSuccess} message="Your agent has been created!" />
      <LaunchOptionsModal
        open={showLaunchOptions}
        onClose={() => setShowLaunchOptions(false)}
        setQuickCreationOpen={setQuickCreationOpen}
        setAdvancedModalOpen={setAdvancedModalOpen}
        setAPICreationOpen={setAPICreationOpen}
        setPromptCreationOpen={setPromptCreationOpen}
      />
      <QuickCreation
        isUploading={props.isUploading}
        open={quickCreationOpen}
        onClose={handleQuickCreationClose}
        setAdvancedModalOpen={setAdvancedModalOpen}
        connected={connected}
        publicKey={publicKey}
      />
      <AdvancedModal
        isUploading={props.isUploading}
        formOpen={advancedModalOpen}
        setFormOpen={setAdvancedModalOpen}
        connected={connected}
        publicKey={publicKey}
        handleAdvancedModalClose={handleAdvancedModalClose}
        handleAdvancedModalOpen={handleAdvancedModalOpen}
      />
      <APICreationModal
        open={apiCreationOpen}
        onClose={() => setAPICreationOpen(false)}
      />
      <PromptCreationModal
        open={promptCreationOpen}
        onClose={() => setPromptCreationOpen(false)}
      />
    </div>
  );
};

export default QuickPromptCreation;
