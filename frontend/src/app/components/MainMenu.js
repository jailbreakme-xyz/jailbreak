"use client";
import React from "react";
import {
  FaHome,
  FaUsers,
  FaTelegramPlane,
  FaCode,
  FaQuestionCircle,
  FaInfoCircle,
  FaFileContract,
} from "react-icons/fa";

import "../../styles/Chat.css";
import Link from "next/link";
import { SiGitbook, SiGithub } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { GiBreakingChain, GiTwoCoins } from "react-icons/gi";
import Image from "next/image";
import SolIcon from "../../assets/solIcon.png";

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
        <Link target="_blank" href="/" className="chatMainMenuItem pointer">
          <FaHome size={25} /> <span>HOME</span>
        </Link>
        {!props.hiddenItems?.includes("BREAK") && (
          <Link href="/break/Myrios" className="chatMainMenuItem pointer">
            <GiBreakingChain size={25} /> <span>BREAK</span>
          </Link>
        )}
        {!props.hiddenItems?.includes("API") && (
          <Link href="/docs" className="chatMainMenuItem pointer">
            <FaCode size={25} /> <span>API</span>
          </Link>
        )}
        <Link target="_blank" href="/faq" className="chatMainMenuItem pointer">
          <FaQuestionCircle size={25} /> <span>FAQ</span>
        </Link>
        <Link href="/jail-token" className="chatMainMenuItem pointer">
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
                href="https://solscan.io/account/B1XbZeQYZxv5ezBpBgomEUqDvTbM8HwSYfktcpBGkgjg"
                target="_blank"
                className="pointer imgIcon"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Image
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
                href="https://github.com/probonodev/jailbreak"
                target="_blank"
                className="pointer"
              >
                <SiGithub size={30} className="pointer" />
              </a>
            </div>
          </div>
        )}

        {props.challenge?.name && (
          <div
            style={{ textAlign: "left", margin: "0px 0px 0px 0px" }}
            className="chatMainMenuItem chatPageSocialMenu"
          >
            <span>
              <FaInfoCircle size={25} /> INFO
            </span>
            <hr />
            <div className="stats">
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "normal",
                  margin: "8px 0px",
                }}
              >
                <strong>Characters Per Message:</strong> ~
                {numberWithCommas(props.challenge.characterLimit)}
              </p>

              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "normal",
                  margin: "8px 0px",
                }}
              >
                <strong>Context Window:</strong> ~{props.challenge.contextLimit}
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "normal",
                  margin: "8px 0px",
                }}
              >
                <strong>UI Chat Limit:</strong> ~
                {props.challenge.chatLimit || "Unlimited"}
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "normal",
                  margin: "8px 0px",
                }}
              >
                <strong>Developer Fee: </strong>
                {props.challenge.developer_fee}%
              </p>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "normal",
                  margin: "8px 0px",
                }}
              >
                Message fees increase the prize pool.
              </p>
              {props.challenge?.custom_rules && (
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "normal",
                    margin: "8px 0px",
                  }}
                >
                  {props.challenge?.custom_rules}
                </p>
              )}
              <a
                href={`/agent/${props.challenge?.name}`}
                target="_blank"
                className="pointer"
                style={{
                  color: "#09bf99",
                  fontSize: "16px",
                  fontWeight: "normal",
                }}
              >
                Read More →
              </a>
              {/* <div
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
                <a
                  href={`/agent/${props.challenge?.name}`}
                  target="_blank"
                  className="pointer"
                  style={{ color: "#09bf99" }}
                >
                  Read More →
                </a>
              </div> */}
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default MainMenu;
