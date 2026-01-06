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
import PromptCreationModal from "./PromptCreationModal";
import LaunchOptionsModal from "./modals/LaunchOptionsModal";
import { IoChevronDown } from "react-icons/io5";
import "../../styles/Header.css";

function AnnouncementBar() {
  return (
    <a
      href="https://x.com/jailbreakme_xyz/status/1879666277683429868"
      target="_blank"
      rel="noopener noreferrer"
      className="announcement-bar"
    >
      <span className="announcement-icon">🏆</span>
      <span className="announcement-text">
        <span className="desktop">Jailbreak is proud to take </span>
        <strong>3rd place</strong> in the Solana AI Hackathon!
      </span>
      <span className="announcement-arrow">→</span>
    </a>
  );
}

const Header = (props) => {
  const { publicKey, connected, connect } = useWallet();
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [quickCreationOpen, setQuickCreationOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [elizaCreationOpen, setElizaCreationOpen] = useState(false);
  const [apiCreationOpen, setAPICreationOpen] = useState(false);
  const [promptCreationOpen, setPromptCreationOpen] = useState(false);
  const [launchOptionsOpen, setLaunchOptionsOpen] = useState(false);
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

  const handlePopoverOpen = (event) => {
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

  const handlePromptCreate = () => {
    handlePopoverClose();
    setPromptCreationOpen(true);
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
    <>
      <AnnouncementBar />
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
            Agents
          </a>
          <a
            href={undefined}
            onClick={() => setLaunchOptionsOpen(true)}
            className="beta-header-link pointer"
          >
            Launchpad
          </a>
          <a
            className="beta-header-link pointer projects-button"
            onClick={handlePopoverOpen}
          >
            Projects
            <IoChevronDown
              className={`chevron-icon ${Boolean(anchorEl) ? "rotate" : ""}`}
            />
          </a>
          <a href="/docs" className="beta-header-link pointer">
            Docs
          </a>
          {/* <a
          href="https://dexscreener.com/solana/3bwe561z8w4aX2DiB55EjLAbngzMKGy1GZMCyRFbocPn"
          className="beta-header-link pointer"
          target="_blank"
        >
          $JAIL
        </a> */}
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
          <PromptCreationModal
            open={promptCreationOpen}
            onClose={() => setPromptCreationOpen(false)}
          />
          <LaunchOptionsModal
            open={launchOptionsOpen}
            onClose={() => setLaunchOptionsOpen(false)}
            setQuickCreationOpen={setQuickCreationOpen}
            setAdvancedModalOpen={setAdvancedModalOpen}
            setAPICreationOpen={setAPICreationOpen}
            setPromptCreationOpen={setPromptCreationOpen}
          />
        </div>
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
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(10px)",
                boxShadow:
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              },
            },
          }}
        >
          <div className="popover-content">
            <a href="/jailx" className="beta-header-link pointer">
              JailX™
            </a>
            <a href="/alcatraz-whitepaper" className="beta-header-link pointer">
              Alcatraz™
            </a>
          </div>
        </Popover>
      </div>
    </>
  );
};

export default Header;
