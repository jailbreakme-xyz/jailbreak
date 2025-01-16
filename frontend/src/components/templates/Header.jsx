import React, { useState, useEffect } from "react";
import SocialIcons from "../partials/SocialIcons";
import MobileMenu from "../MobileMenu";
import "../../styles/Beta.css";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import QuickCreation from "./QuickCreation";
import AdvancedModal from "./AdvancedModal";
import { Popover } from "@mui/material";
import logo from "../../assets/logo.png";
import lightSlogen from "../../assets/lightSlogen.png";
import APICreationModal from "./APICreationModal";

const Header = (props) => {
  const { publicKey, connected, connect } = useWallet();
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [quickCreationOpen, setQuickCreationOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [elizaCreationOpen, setElizaCreationOpen] = useState(false);
  const [apiCreationOpen, setAPICreationOpen] = useState(false);

  const handleQuickCreationOpen = () => {
    setQuickCreationOpen(true);
  };

  const handleQuickCreationClose = () => {
    setQuickCreationOpen(false);
    props.isUploading.current = false;
  };

  const handleAdvancedModalClose = () => {
    setAdvancedModalOpen(false);
    props.isUploading.current = false;
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

  const handleElizaCreation = () => {
    handlePopoverClose();
    setElizaCreationOpen(true);
  };

  const handleAPICreate = () => {
    handlePopoverClose();
    setAPICreationOpen(true);
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
          src={logo}
          width="30"
          className="pointer mainLogo"
          style={{ backgroundColor: "#ebebeb" }}
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <img
          alt="logo"
          src={lightSlogen}
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
                color: "#0bbf99",
                background: "rgba(0, 0, 0, 0.5)",
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
            <div onClick={handleAPICreate} className="popover-item pointer">
              Integrate an API
            </div>
            <div
              onClick={handleElizaCreation}
              className="popover-item disabled"
            >
              Create Eliza Character (Coming Soon)
            </div>
          </div>
        </Popover>
        <a href="/jailx" className="beta-header-link pointer">
          JAILX
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
            component={props.component}
            solPrice={props.solPrice}
            address={props.address}
            handleQuickCreationOpen={handleQuickCreationOpen}
          />
        </div>
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
      </div>
    </div>
  );
};

export default Header;
