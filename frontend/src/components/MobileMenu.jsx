import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaQuestionCircle,
  FaUsers,
  FaTimes,
  FaChartLine,
} from "react-icons/fa";
import { FaTelegramPlane, FaBook } from "react-icons/fa";
import { SiGitbook, SiGithub } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { TiThMenu } from "react-icons/ti";
import CountUp from "react-countup";
import {
  GiBreakingChain,
  GiTwoCoins,
  GiArtificialIntelligence,
} from "react-icons/gi";
import Jdenticon from "react-jdenticon";
import { MdRocketLaunch, MdEngineering } from "react-icons/md";

function numberWithCommas(x) {
  return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const MobileMenu = (props) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = !menuOpen ? "hidden" : "unset";
  };

  return (
    <div className={`mobileMenu ${props.absolute ? "absolute" : ""}`}>
      <button
        className="hamburgerButton"
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        {menuOpen ? <FaTimes size={24} /> : <TiThMenu size={24} />}
      </button>

      <div
        className={`menuOverlay ${menuOpen ? "open" : ""}`}
        onClick={toggleMenu}
      >
        <div
          className={`menuContent ${menuOpen ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* <img
            src={"/images/lightSlogen.png"}
            alt="logo"
            className="menuLogo"
          /> */}

          <nav className="menuNav">
            <Link to="/" onClick={toggleMenu}>
              <FaHome /> <span>Home</span>
            </Link>

            <Link to="/agents" onClick={toggleMenu}>
              <GiArtificialIntelligence /> <span>Agents</span>
            </Link>

            <Link to="/breakers" onClick={toggleMenu}>
              <GiBreakingChain /> <span>Breakers</span>
            </Link>

            <Link
              to="#"
              onClick={() => {
                props.handleQuickCreationOpen();
                toggleMenu();
              }}
            >
              <MdRocketLaunch /> <span>Create Agent</span>
            </Link>

            <Link to="/jailx" onClick={toggleMenu}>
              <img
                src="https://storage.googleapis.com/jailbreakme-images/jailxLogo.png"
                alt="JailX"
                className="menuIcon"
              />
              <span>JailX™</span>
            </Link>

            <Link to="/alcatraz-whitepaper" onClick={toggleMenu}>
              <img
                src="https://storage.googleapis.com/jailbreakme-images/alcatraz.webp"
                alt="Alcatraz"
                className="menuIcon"
              />
              <span>Alcatraz™</span>
            </Link>

            <Link to="/docs" onClick={toggleMenu}>
              <FaBook /> <span>Docs</span>
            </Link>

            <Link to="/faq" onClick={toggleMenu}>
              <FaQuestionCircle /> <span>FAQ</span>
            </Link>

            {/* <Link
              to="https://dexscreener.com/solana/3bwe561z8w4aX2DiB55EjLAbngzMKGy1GZMCyRFbocPn"
              target="_blank"
              onClick={toggleMenu}
            >
              <GiTwoCoins /> <span>$JAIL Token</span>
            </Link> */}

            {props.address && (
              <Link to={`/breaker/${props.address}`} onClick={toggleMenu}>
                <Jdenticon value={props.address} size={24} />
                <span>My Profile</span>
              </Link>
            )}
          </nav>

          {!props.hiddenItems?.includes("SOCIAL") && (
            <div className="socialLinks">
              <div className="socialIcons">
                <a href="https://twitter.com/jailbreakme_xyz" target="_blank">
                  <FaXTwitter />
                </a>
                <a href="https://t.me/jailbreakme_xyz" target="_blank">
                  <FaTelegramPlane />
                </a>
                <a
                  href="https://solscan.io/account/43m2CSa83AVK6yT7SpZ1KFcScWfxyfid7nQx2KUMWJko"
                  target="_blank"
                >
                  <img
                    src="/images/solIcon.png"
                    alt="Solana"
                    width={20}
                    height={20}
                  />
                </a>
                <a
                  href="https://jailbreak.gitbook.io/jailbreakme.xyz"
                  target="_blank"
                >
                  <SiGitbook />
                </a>
                <a href="https://github.com/jailbreakme-xyz" target="_blank">
                  <SiGithub />
                </a>
              </div>
            </div>
          )}

          {props.component === "break" && props.challenge && (
            <div className="statsSection">
              <div className="statsList">
                <div className="statItem">
                  <label>Prize</label>
                  <CountUp
                    start={0}
                    end={props.usdPrize || props.prize * props.solPrice}
                    duration={2.75}
                    decimals={2}
                    prefix="$"
                  />
                </div>
                <div className="statItem">
                  <label>Break Attempts</label>
                  <CountUp start={0} end={props.attempts} duration={2.75} />
                </div>
                <div className="statItem">
                  <label>Message Price</label>
                  <CountUp
                    start={0}
                    end={props.usdPrice}
                    duration={2.75}
                    decimals={2}
                    prefix="$"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .mobileMenu {
          position: relative;
          z-index: 1000;
        }

        .hamburgerButton {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(11, 191, 153, 0.1);
          border: none;
          color: #0bbf99;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(11, 191, 153, 0.1);
          z-index: 1001;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menuOverlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .menuOverlay.open {
          opacity: 1;
          visibility: visible;
        }

        .menuContent {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          max-width: 400px;
          height: 95vh !important;
          background: rgba(18, 18, 18, 0.95);
          backdrop-filter: blur(10px);
          padding: 20px 24px 24px;
          transition: right 0.3s ease;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          -webkit-overflow-scrolling: touch;
        }

        .menuContent.open {
          right: 0;
        }

        .menuLogo {
          width: 180px;
          margin: 0 auto 24px;
        }

        .menuNav {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .menuNav a {
          display: flex;
          align-items: center;
          gap: 12px;
          color: white;
          text-decoration: none;
          padding: 12px;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .menuNav a:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .menuIcon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #0bbf99;
        }

        .socialLinks {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
        }

        .socialLinks h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #0bbf99;
        }

        .socialIcons a {
          color: white;
          font-size: 24px;
          transition: color 0.2s ease;
        }

        .socialIcons a:hover {
          color: #0bbf99;
        }

        .statsSection {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 24px;
        }

        .statsSection h3 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #0bbf99;
        }

        .statsList {
          display: grid;
          gap: 16px;
        }

        .statItem {
          background: rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }

        .statItem label {
          display: block;
          color: #666;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .closeButton {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          border: none;
          color: black;
          font-size: 24px;
          cursor: pointer;
          padding: 10px;
          z-index: 1002;
        }
      `}</style>
    </div>
  );
};

export default MobileMenu;
