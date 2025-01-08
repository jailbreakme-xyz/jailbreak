import React, { useState } from "react";
import SocialIcons from "../partials/SocialIcons";
import "../../styles/Beta.css";
import { useWallet } from "@solana/wallet-adapter-react";
import QuickCreation from "./QuickCreation";
import AdvancedModal from "./AdvancedModal";

const Footer = (props) => {
  const { publicKey, connected, connect } = useWallet();
  const [advancedModalOpen, setAdvancedModalOpen] = useState(false);
  const [quickCreationOpen, setQuickCreationOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

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

  return (
    <div className="beta-footer">
      <div className="footer-content">
        {/* Left Column - Logo & Copyright */}
        <div className="footer-brand">
          <img
            alt="logo"
            src="/images/logo.png"
            className="pointer mainLogo"
            style={{
              backgroundColor: "#ebebeb",
              border: "6px double black",
              padding: "5px",
            }}
            onClick={() => {
              window.location.href = "/";
            }}
          />
          <p className="copyright">© {new Date().getFullYear()} JailbreakMe</p>
        </div>

        {/* Middle Column - Quick Links */}
        <div className="footer-links">
          <div className="footer-links-group">
            <h4>Legacy Agents</h4>
            <a href="/agent/myrios" className="footer-link pointer">
              Myrios
            </a>
            <a href="/agent/echo" className="footer-link pointer">
              Echo
            </a>
            <a href="/agent/clara" className="footer-link pointer">
              Clara
            </a>
            <a href="/agent/sigma" className="footer-link pointer">
              Sigma
            </a>
            <a href="/agent/zynx" className="footer-link pointer">
              Zynx
            </a>
          </div>
          <div className="footer-links-group">
            <h4>Site Links</h4>
            <a href="/" className="footer-link pointer">
              Home
            </a>
            <a href="/agents" className="footer-link pointer">
              Agents
            </a>
            <a href="/breakers" className="footer-link pointer">
              Breakers
            </a>
            <a href="/jailx" className="footer-link pointer">
              JailX
            </a>
            <a href="/jail-tokens" className="footer-link pointer">
              $JAIL
            </a>
          </div>
          <div className="footer-links-group">
            <h4>Resources</h4>
            <a
              href="https://jailbreak.gitbook.io/jailbreakme.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link pointer"
            >
              Docs
            </a>
            <a href="/faq" className="footer-link pointer">
              FAQ
            </a>
          </div>
          <div className="footer-links-group">
            <h4>Launchpad</h4>
            <a
              href={undefined}
              onClick={handleQuickCreate}
              className="footer-link pointer"
            >
              Quick Creation
            </a>
            <a
              href={undefined}
              onClick={handleAdvancedCreate}
              className="footer-link pointer"
            >
              Advanced Creation
            </a>
          </div>
        </div>

        {/* Right Column - Social Links */}
        <div className="footer-social">
          <SocialIcons />
        </div>
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
    </div>
  );
};

export default Footer;
