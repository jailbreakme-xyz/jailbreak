"use client";
import React from "react";
import Image from "next/image";
import StoneLogo from "../../../assets/stone_logo.png";
import lightSlogen from "../../../assets/lightSlogen.png";
import SocialIcons from "../partials/SocialIcons";
import "../../../styles/Beta.css";

const Footer = () => {
  return (
    <div className="beta-footer">
      <Image
        alt="logo"
        src={StoneLogo}
        width="50"
        className="pointer mainLogo"
      />
      <Image alt="logo" src={lightSlogen} width="140" className="pointer" />
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
