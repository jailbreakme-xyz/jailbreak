"use client";
import React, { useState, useEffect } from "react";
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
import { Popover } from "@mui/material";

const Header = (props) => {
  const { publicKey, connected, connect } = useWallet();
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [quickCreationOpen, setQuickCreationOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

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

  const handleCreateClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleQuickCreate = () => {
    handlePopoverClose();
    handleQuickCreationOpen();
  };

  const handleAdvancedCreate = () => {
    handlePopoverClose();
    handleAdvancedModalOpen();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`beta-header ${isSticky && !props.noSticky ? "sticky" : ""}`}
      style={{ backgroundColor: !isSticky ? "#000" : "transparent" }}
    >
      <div className="beta-header-left desktop">
        <img
          alt="logo"
          src="/images/logo.png"
          width="35"
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
          onClick={handleCreateClick}
          className="beta-header-link pointer"
        >
          CREATE AGENT
        </a>
        <Popover
          sx={{ zIndex: "999999999999999" }}
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          slotProps={{
            paper: {
              style: {
                // backgroundColor: "#181726",
                // border: "1px solid #9e9e9e",
                color: "#0bbf99",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              },
            },
          }}
        >
          <div>
            <div onClick={handleQuickCreate} className="popover-item pointer">
              Quick Creation
            </div>
            <div
              onClick={handleAdvancedCreate}
              className="popover-item pointer"
            >
              Advanced Creation
            </div>
          </div>
        </Popover>
        {/* <a href="/faq" className="beta-header-link pointer">
          FAQ
        </a> */}
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
            width="20"
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
