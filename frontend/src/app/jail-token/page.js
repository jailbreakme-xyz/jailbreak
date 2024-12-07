"use client";
import React from "react";
import Image from "next/image";
import stoneLogo from "../../assets/stoneLogo.png";
import MainMenu from "../components/MainMenu";
import MobileMenu from "../components/MobileMenu";
import lightSlogen from "../../assets/lightSlogen.png";
import JailTokensSection from "../components/partials/JailTokensSection";
import "../../styles/FAQ.css";

const Token = () => {
  return (
    <main>
      <MobileMenu absolute={true} />
      <div
        style={{ textAlign: "center", display: "grid", placeItems: "center" }}
      >
        <Image
          alt="logo"
          src={stoneLogo}
          width="80"
          style={{
            borderRadius: "0px 0px 150px 150px",
            marginBottom: "10px",
          }}
          className="pointer"
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <Image
          className="pointer"
          onClick={() => {
            window.location.href = "/";
          }}
          alt="logo"
          src={lightSlogen}
          width="120"
        />
        <h2 className="faq-title">$JAIL Tokens</h2>
      </div>
      <hr />
      <div className="docsPage">
        <MainMenu />
        <JailTokensSection />
      </div>
    </main>
  );
};

export default Token;
