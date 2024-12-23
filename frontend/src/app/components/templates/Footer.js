"use client";
import React from "react";
import Image from "next/image";
import StoneLogo from "../../../assets/stone_logo.png";
import logo from "../../../assets/logo.png";
import lightSlogen from "../../../assets/lightSlogen.png";
import SocialIcons from "../partials/SocialIcons";
import "../../../styles/Beta.css";

const Footer = () => {
  return (
    <div className="beta-footer">
      <img
        alt="logo"
        src="/images/logo.png"
        width="40"
        className="pointer mainLogo"
        style={{
          backgroundColor: "#ebebeb",
          border: "6px double #000",
          padding: "5px",
        }}
        onClick={() => {
          window.location.href = "/";
        }}
      />
      <img
        alt="logo"
        src="/images/lightSlogen.png"
        width="140"
        className="pointer"
      />
      <br />
      <SocialIcons />

      <div className="beta-footer-links">
        <a href="/" className="beta-header-link pointer">
          HOME
        </a>
        <a
          href="https://jailbreak.gitbook.io/jailbreakme.xyz"
          target="_blank"
          className="beta-header-link pointer"
        >
          DOCS
        </a>
        <a href="/docs" className="beta-header-link pointer">
          API
        </a>
        <a href="/faq" className="beta-header-link pointer">
          FAQ
        </a>
        <a href="/jail-token" className="beta-header-link pointer">
          $JAIL
        </a>
      </div>
    </div>
  );
};

export default Footer;
