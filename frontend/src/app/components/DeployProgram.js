// src/DeployProgram.js
"use client";
import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import axios from "axios";

const DeployProgram = () => {
  const { publicKey, sendTransaction, connected, connect } = useWallet();
  const SOLANA_RPC =
    process.env.NODE_ENV === "development"
      ? "https://brande-ffqoic-fast-devnet.helius-rpc.com"
      : "https://rosette-xbrug1-fast-mainnet.helius-rpc.com";
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [programId, setProgramId] = useState(null);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      alert("Please connect your wallet first.");
      return;
    }
    setLoading("Preparing transaction...");
    const success = await getDeploymentTransaction();
    setLoading(null);
    if (success) {
      alert("Tournament program deployed successfully!");
    }
  };

  const getDeploymentTransaction = async () => {
    try {
      const connection = new Connection(SOLANA_RPC, "confirmed");
      const response = await axios.post("/api/program/deploy-tournament", {
        sender: publicKey.toString(),
      });

      setLoading("Waiting for confirmation...");
      const { serializedTransaction, program_id } = response.data;
      setProgramId(program_id);
      const transaction = Transaction.from(
        Buffer.from(serializedTransaction, "base64")
      );
      const signedTransaction = await sendTransaction(transaction, connection);
      setLoading("Deploying program...");
      console.log("Transaction sent:", signedTransaction);
      const confirmation = await connection.confirmTransaction({
        signature: signedTransaction,
        commitment: "confirmed",
      });

      if (confirmation.value.err) {
        setError(
          "Transaction failed: " + JSON.stringify(confirmation.value.err)
        );
        return false;
      }

      return { signedTransaction };
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Payment failed. Please try again.");
      setLoading(null);
      return false;
    }
  };

  const createTournament = async (e) => {
    e.preventDefault();
    console.log("Creating tournament...");
  };

  const stepContent = {
    1: (
      <div>
        <h1>Deploy Tournament Program 🚀</h1>
        <hr />
        <p>
          By deploying this program, you unlock the ability to create and manage
          unlimited tournaments directly from your profile page.
          <br />
          This upgrade empowers you to host and oversee competitions, enhancing
          your profile's capabilities and engagement with the community.
        </p>
        <p>
          <strong>
            *This is a one-time setup fee to enable these advanced features.
          </strong>
        </p>
        <form>
          {connected && publicKey ? (
            <button type="submit" disabled={true} className="disabled">
              {loading ? loading : "Deploy Program (Coming Soon) 🚀"}
            </button>
          ) : (
            <WalletMultiButton />
          )}
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    ),
  };

  return <div className="deploy-program-container">{stepContent[step]}</div>;
};

export default DeployProgram;
