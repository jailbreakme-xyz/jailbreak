"use client";
import React from "react";
import {
  FaHome,
  FaUsers,
  FaTelegramPlane,
  FaCode,
  FaQuestionCircle,
  FaInfoCircle,
} from "react-icons/fa";

import "../../styles/Chat.css";
import Link from "next/link";
import { SiGitbook, SiGithub } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { GiBreakingChain } from "react-icons/gi";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const MainMenu = (props) => {
  return (
    <div className="mainMenu desktopMenu">
      <>
        <Link target="_blank" href="/" className="chatMainMenuItem pointer">
          <FaHome size={25} /> HOME
        </Link>
        {!props.hiddenItems?.includes("BREAK") && (
          <Link
            href="/challenge/67464991a95c1b426ef3920d"
            className="chatMainMenuItem pointer"
          >
            <GiBreakingChain size={25} /> BREAK
          </Link>
        )}
        {!props.hiddenItems?.includes("API") && (
          <Link href="/docs" className="chatMainMenuItem pointer">
            <FaCode size={25} /> API
          </Link>
        )}
        <Link target="_blank" href="/faq" className="chatMainMenuItem pointer">
          <FaQuestionCircle size={25} /> FAQ
        </Link>
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
              href="https://jailbreak.gitbook.io/jailbreakme.xyz"
              target="_blank"
              className="pointer"
            >
              <SiGitbook size={30} className="pointer" />
            </a>
            <a
              href="https://github.com/probonodev/jailbreak"
              target="_blank"
              className="pointer"
            >
              <SiGithub size={30} className="pointer" />
            </a>
          </div>
        </div>
        {props.challenge?.name && (
          <div
            style={{ textAlign: "left", margin: "0px 0px 5px 0px" }}
            className="chatMainMenuItem chatPageSocialMenu"
          >
            <span>
              <FaInfoCircle size={25} /> INFO
            </span>
            <hr />
            <div className="stats">
              <p style={{ fontSize: "16px", fontWeight: "normal" }}>
                The chat displays up to 50 messages. However, only your messages
                are sent to {props.challenge?.name} for context.
              </p>
              <p style={{ fontSize: "16px", fontWeight: "normal" }}>
                70% of all message fees go to growing the prize pool.
              </p>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "normal",
                  textTransform: "none",
                  lineHeight: "10px",
                }}
              >
                <span style={{ fontWeight: "bold" }}>Limitations:</span>
                <p>
                  {numberWithCommas(props.challenge?.characterLimit)} characters
                  per message.
                </p>
                <p>{props.challenge?.contextLimit} messages per context.</p>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default MainMenu;
