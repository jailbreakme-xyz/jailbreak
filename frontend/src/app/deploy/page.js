"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import DeployProgram from "../components/DeployProgram";
import Header from "../components/templates/Header";

export default function Deploy() {
  return (
    <div style={{ minHeight: "100vh" }} className="fullWidthPage">
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "85vh",
        }}
      >
        <DeployProgram />
      </div>
    </div>
  );
}
