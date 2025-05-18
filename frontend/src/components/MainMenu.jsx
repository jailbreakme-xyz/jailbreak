import React from "react";
import {
  FaHome,
  FaUsers,
  FaTelegramPlane,
  FaCode,
  FaQuestionCircle,
} from "react-icons/fa";

import "../styles/Chat.css";
import { Link } from "react-router-dom";
import { SiGitbook, SiGithub } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { GiBreakingChain, GiTwoCoins } from "react-icons/gi";
import SolIcon from "../assets/solIcon.png";

const MainMenu = (props) => {
  return (
    <div
      className={
        props.component === "break"
          ? "mainMenu desktopMenu breakMenu"
          : "mainMenu desktopMenu"
      }
    >
      <>
        <Link target="_blank" to="/" className="chatMainMenuItem pointer">
          <FaHome size={25} /> <span>HOME</span>
        </Link>
        {!props.hiddenItems?.includes("BREAK") && (
          <Link to="/break/Myrios" className="chatMainMenuItem pointer">
            <GiBreakingChain size={25} /> <span>BREAK</span>
          </Link>
        )}
        {!props.hiddenItems?.includes("API") && (
          <Link to="/docs" className="chatMainMenuItem pointer">
            <FaCode size={25} /> <span>API</span>
          </Link>
        )}
        <Link target="_blank" to="/faq" className="chatMainMenuItem pointer">
          <FaQuestionCircle size={25} /> <span>FAQ</span>
        </Link>
        <Link
          // to="https://dexscreener.com/solana/card131dsufcqfky9ciczd4qj5hbazsqlklsekjjmadp"
          className="chatMainMenuItem pointer"
          target="_blank"
        >
          <GiTwoCoins size={25} /> <span>$JAIL TOKENS</span>
        </Link>
        {!props.hiddenItems?.includes("SOCIAL") && (
          <div className="chatMainMenuItem chatPageSocialMenu">
            <span className="">
              <FaUsers size={25} /> LINKS
            </span>
            <hr />
            <div className="chatPageSocialIcons">
              <a
                href="https://twitter.com/jailbreakme_xyz"
                target="_blank"
                className="pointer"
              >
                <FaXTwitter size={30} className="pointer" />
              </a>
              <a
                href="https://t.me/jailbreakme_xyz"
                target="_blank"
                className="pointer"
              >
                <FaTelegramPlane size={30} className="pointer" />
              </a>
              <a
                href="https://solscan.io/account/43m2CSa83AVK6yT7SpZ1KFcScWfxyfid7nQx2KUMWJko"
                target="_blank"
                className="pointer imgIcon"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={SolIcon}
                  alt="Solana"
                  width={30}
                  height={30}
                  className="pointer"
                />
              </a>
              <a
                href="https://jailbreak.gitbook.io/jailbreakme.xyz"
                target="_blank"
                className="pointer"
              >
                <SiGitbook size={30} className="pointer" />
              </a>
              <a
                href="https://github.com/jailbreakme-xyz"
                target="_blank"
                className="pointer"
              >
                <SiGithub size={30} className="pointer" />
              </a>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default MainMenu;
