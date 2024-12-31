"use client";
import React, { useState } from "react";
import Image from "next/image";
import StoneLogo from "../../../assets/stone_logo.png";
import logo from "../../../assets/logo.png";
import lightSlogen from "../../../assets/lightSlogen.png";
import SocialIcons from "../partials/SocialIcons";
import MobileMenu from "../MobileMenu";
import "../../../styles/Beta.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import QuickCreation from "./QuickCreation";
import AdvancedModal from "./AdvancedModal";

const Header = (props) => {
  const { publicKey, connected, connect } = useWallet();
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [quickCreationOpen, setQuickCreationOpen] = useState(false);

  const handleQuickCreationOpen = () => {
    setQuickCreationOpen(true);
  };

  const handleQuickCreationClose = () => {
    setQuickCreationOpen(false);
  };

  const handleAdvancedModalClose = () => {
    setAdvancedModalOpen(false);
  };

  const handleAdvancedModalOpen = () => {
    setAdvancedModalOpen(true);
  };

  return (
    <div className="beta-header">
      <div className="beta-header-left desktop">
        <img
          alt="logo"
          src="/images/logo.png"
          width="40"
          className="pointer mainLogo"
          style={{ backgroundColor: "#ebebeb" }}
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <img
          alt="logo"
          src="/images/lightSlogen.png"
          width="140"
          className="pointer mainLogo"
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <div className="separator"></div>
        <a href={`/agents`} className="beta-header-link pointer">
          AGENTS
        </a>
        <a href="/breakers" className="beta-header-link pointer">
          BREAKERS
        </a>
        <a
          href={undefined}
          onClick={handleQuickCreationOpen}
          className="beta-header-link pointer"
        >
          CREATE AGENT
        </a>
        <a href="/faq" className="beta-header-link pointer">
          FAQ
        </a>
        <a
          href="https://dexscreener.com/solana/card131dsufcqfky9ciczd4qj5hbazsqlklsekjjmadp"
          className="beta-header-link pointer"
          target="_blank"
        >
          $JAIL
        </a>
      </div>
      <div className="beta-header-right desktop">
        <SocialIcons
          component={props.component}
          address={publicKey?.toString()}
        />
        <WalletMultiButton />
      </div>
      <div className="mobile">
        <div className="beta-mobile-header-left">
          <img
            alt="logo"
            src="/images/logo.png"
            width="40"
            className="pointer"
            style={{ backgroundColor: "#ebebeb" }}
            onClick={() => {
              window.location.href = "/";
            }}
          />
          <img
            alt="logo"
            src="/images/lightSlogen.png"
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
            handleQuickCreationOpen={handleQuickCreationOpen}
          />
        </div>
        <QuickCreation
          open={quickCreationOpen}
          onClose={handleQuickCreationClose}
          setAdvancedModalOpen={setAdvancedModalOpen}
          connected={connected}
          publicKey={publicKey}
        />
        <AdvancedModal
          formOpen={advancedModalOpen}
          setFormOpen={setAdvancedModalOpen}
          connected={connected}
          publicKey={publicKey}
          handleAdvancedModalClose={handleAdvancedModalClose}
          handleAdvancedModalOpen={handleAdvancedModalOpen}
        />
      </div>
    </div>
  );
};

export default Header;
