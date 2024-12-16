"use client";
import React from "react";
import Image from "next/image";
import StoneLogo from "../../../assets/stone_logo.png";
import logo from "../../../assets/logo.png";
import lightSlogen from "../../../assets/lightSlogen.png";
import SocialIcons from "../partials/SocialIcons";
import MobileMenu from "../MobileMenu";
import "../../../styles/Beta.css";

const Header = (props) => {
  return (
    <div className="beta-header">
      <div className="beta-header-left desktop">
        <Image
          alt="logo"
          src={logo}
          width="40"
          className="pointer mainLogo"
          style={{ backgroundColor: "#ebebeb" }}
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <Image
          alt="logo"
          src={lightSlogen}
          width="140"
          className="pointer mainLogo"
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <div className="separator"></div>
        <a href="/" className="beta-header-link pointer">
          HOME
        </a>
        <a
          href={`/break/${props.activeChallenge?.name}`}
          className="beta-header-link pointer"
        >
          BREAK
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
      <div className="beta-header-right desktop">
        <SocialIcons component={props.component} address={props.address} />
      </div>
      <div className="mobile">
        <div className="beta-mobile-header-left">
          <Image
            alt="logo"
            src={logo}
            width="40"
            className="pointer"
            style={{ backgroundColor: "#ebebeb" }}
            onClick={() => {
              window.location.href = "/";
            }}
          />
          <Image
            alt="logo"
            src={lightSlogen}
            width="100"
            className="pointer"
            onClick={() => {
              window.location.href = "/";
            }}
          />
        </div>
        <div className="beta-mobile-header-right">
          <MobileMenu
            attempts={props.attempts}
            price={props.price}
            prize={props.prize}
            hiddenItems={props.hiddenItems}
            challenge={props.challenge}
            usdPrice={props.usdPrice}
            usdPrize={props.usdPrize}
            activeChallenge={props.activeChallenge}
            component={props.component}
            solPrice={props.solPrice}
            address={props.address}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
