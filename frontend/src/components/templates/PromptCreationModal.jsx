import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import OutlinedInput from "@mui/material/OutlinedInput";
import NumberInputAdornments from "../mui/NumberInput";
import LoadingModal from "./modals/LoadingModal";
import ErrorModal from "./modals/ErrorModal";
import axios from "axios";
import { Connection, Transaction } from "@solana/web3.js";
import SuccessModal from "./modals/SuccessModal";
import { useAuthenticatedRequest } from "../../hooks/useAuthenticatedRequest";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
const SOLANA_RPC =
  process.env.NODE_ENV === "development"
    ? "https://brande-ffqoic-fast-devnet.helius-rpc.com"
    : "https://rosette-xbrug1-fast-mainnet.helius-rpc.com";

const PromptCreationModal = ({ open, onClose }) => {
  const { sendTransaction, publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [error, setError] = useState(null);
  const { createAuthenticatedRequest } = useAuthenticatedRequest(setError);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prompt: "",
    initial_pool_size: 0.5,
    fee_multiplier: 1,
    fee_type: 1,
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdAgent, setCreatedAgent] = useState(null);
  const [loadingLabel, setLoadingLabel] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "initial_pool_size" || name === "fee_multiplier"
          ? Math.max(
              name === "initial_pool_size" ? 0.5 : 1,
              Math.min(
                name === "initial_pool_size" ? 100 : 5,
                parseFloat(value) || (name === "initial_pool_size" ? 0.5 : 1)
              )
            )
          : value,
    }));
  };

  const handleCreation = async () => {
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");

      // First authenticate and get token if not already authenticated
      await createAuthenticatedRequest("/api/auth/verify-token", {
        method: "GET",
      });

      setLoading(true);
      // Now proceed with agent creation
      const txResult = await createAuthenticatedRequest(
        "/api/transactions/create-agent-from-prompt",
        {
          method: "POST",
        },
        {
          data: JSON.stringify(formData),
        }
      );

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

      const agentResponse = await createAuthenticatedRequest(
        "/api/program/advanced-start-tournament",
        {
          method: "POST",
        },
        _formData
      );

      if (!agentResponse.savedAgent) {
        throw new Error("Failed to create agent");
      }

      setLoading(false);
      setLoadingLabel(null);
      setCreatedAgent(agentResponse.savedAgent);
      setShowSuccess(true);
      onClose();
    } catch (error) {
      console.error("Error creating agent:", error);
      setError(error.message || "Failed to create agent");
      setLoading(false);
      setLoadingLabel(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (!connected || !publicKey) {
        setVisible(true);
        setLoading(false);
        return;
      }

      await handleCreation();
    } catch (error) {
      console.error("Error creating agent:", error);
      setError(error.message || "Failed to create agent");
      setLoading(false);
    }
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#0bbf99",
      },
      "&:hover fieldset": {
        borderColor: "#0bbf99",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#0bbf99",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#0bbf99",
      "&.Mui-focused": {
        color: "#0bbf99",
      },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
    },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #0bbf99",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid #0bbf99",
            color: "#0bbf99",
            fontWeight: "bold",
          }}
        >
          🚀 Create Agent from Prompt
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ my: 2, color: "#888" }}>
            Describe your agent's personality and behavior. Our AI will generate
            a complete agent configuration based on your description.
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={4}
            name="prompt"
            label="Agent Description"
            value={formData.prompt}
            onChange={handleChange}
            sx={{ ...inputStyle, mb: 3 }}
          />

          <Box
            sx={{
              display: "flex",
              gap: 2,
              mb: 2,
              width: "100%",
            }}
          >
            <TextField
              type="number"
              name="initial_pool_size"
              label="Initial Pool Size (SOL)"
              value={formData.initial_pool_size}
              onChange={handleChange}
              inputProps={{
                min: 0.5,
                max: 100,
                step: 0.1,
              }}
              sx={{ ...inputStyle, width: "33%" }}
            />
            <TextField
              type="number"
              name="fee_multiplier"
              label="Fee Multiplier"
              value={formData.fee_multiplier}
              onChange={handleChange}
              inputProps={{
                min: 1,
                max: 10,
                step: 1,
              }}
              sx={{ ...inputStyle, width: "33%" }}
            />

            <FormControl sx={{ minWidth: 150, width: "33%" }}>
              <InputLabel
                sx={{
                  color: "#0bbf99",
                  "& .MuiFormLabel-root": {
                    color: "#0bbf99",
                  },
                  "&.Mui-focused": {
                    color: "#0bbf99",
                  },
                }}
              >
                Fee Type
              </InputLabel>
              <Select
                name="fee_type"
                value={formData.fee_type}
                onChange={handleChange}
                input={
                  <OutlinedInput
                    sx={{
                      "& .MuiFormLabel-root": {
                        color: "#0bbf99",
                      },
                    }}
                    label="Fee Type"
                  />
                }
                sx={{
                  color: "#fff",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0bbf99",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0bbf99",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0bbf99",
                    color: "#0bbf99",
                  },
                  "& .MuiFormLabel-root": {
                    color: "#0bbf99",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "#0bbf99",
                  },
                }}
              >
                <MenuItem value={0}>Exponential</MenuItem>
                <MenuItem value={1}>Fixed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: "1px solid #0bbf99",
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              color: "#0bbf99",
              borderColor: "#0bbf99",
              "&:hover": {
                borderColor: "#0bbf99",
                backgroundColor: "rgba(11, 191, 153, 0.1)",
              },
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.prompt}
            sx={{
              backgroundColor: "#0bbf99",
              "&:hover": {
                backgroundColor: "#0aa888",
              },
              "&:disabled": {
                backgroundColor: "#0bbf9980",
              },
              color: "black",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Agent 🚀"
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
        onClose={() => setShowSuccess(false)}
        message="Your agent has been created!"
        agent={createdAgent}
      />
    </>
  );
};

export default PromptCreationModal;
